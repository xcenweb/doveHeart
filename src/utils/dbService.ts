import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { type Message, type ChatRoom } from './chatService'

interface DoveHeartDB extends DBSchema {
    rooms: {
        key: number
        value: ChatRoom
        indexes: { 'by-updatedAt': number }
    }
    messages: {
        key: number
        value: Message & { roomId: number }
        indexes: { 'by-roomId': number; 'by-timestamp': number }
    }
}

const DB_NAME = 'doveheart-chat'
const DB_VERSION = 2

class DBService {
    private dbPromise: Promise<IDBPDatabase<DoveHeartDB>>

    constructor() {
        this.dbPromise = openDB<DoveHeartDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // 创建咨询室表
                if (!db.objectStoreNames.contains('rooms')) {
                    const roomStore = db.createObjectStore('rooms', {
                        keyPath: 'id',
                        autoIncrement: true
                    })
                    roomStore.createIndex('by-updatedAt', 'updatedAt')
                }

                // 创建消息表
                if (!db.objectStoreNames.contains('messages')) {
                    const messageStore = db.createObjectStore('messages', {
                        keyPath: 'id',
                        autoIncrement: true
                    })
                    messageStore.createIndex('by-roomId', 'roomId')
                    messageStore.createIndex('by-timestamp', 'timestamp')
                }
            }
        })
    }

    /**
     * 创建咨询室
     */
    async createRoom(name: string): Promise<number> {
        const db = await this.dbPromise
        const now = Date.now()
        return await db.add('rooms', {
            name,
            createdAt: now,
            updatedAt: now
        })
    }

    /**
     * 获取所有咨询室
     */
    async getAllRooms(): Promise<ChatRoom[]> {
        const db = await this.dbPromise
        const rooms = await db.getAll('rooms')
        return rooms
            .sort((a, b) => {
                if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
                return b.updatedAt - a.updatedAt
            })
    }

    /**
     * 设置咨询室置顶状态
     */
    async setRoomPinned(id: number, isPinned: boolean): Promise<void> {
        const db = await this.dbPromise
        const room = await db.get('rooms', id)
        if (room) {
            room.isPinned = isPinned
            room.updatedAt = Date.now()
            await db.put('rooms', room)
        }
    }

    /**
     * 获取咨询室
     */
    async getRoom(id: number): Promise<ChatRoom | undefined> {
        const db = await this.dbPromise
        return await db.get('rooms', id)
    }

    /**
     * 更新咨询室名称
     */
    async updateRoomName(id: number, name: string): Promise<void> {
        const db = await this.dbPromise
        const room = await db.get('rooms', id)
        if (room) {
            room.name = name
            room.updatedAt = Date.now()
            await db.put('rooms', room)
        }
    }

    /**
     * 删除咨询室（同时删除所有消息）
     */
    async deleteRoom(id: number): Promise<void> {
        const db = await this.dbPromise
        const tx = db.transaction(['rooms', 'messages'], 'readwrite')
        await tx.objectStore('rooms').delete(id)
        const messages = await tx.objectStore('messages').index('by-roomId').getAllKeys(id)
        for (const msgId of messages) {
            await tx.objectStore('messages').delete(msgId)
        }
        await tx.done
    }

    /**
     * 添加消息
     */
    async addMessage(message: Omit<Message, 'id'>): Promise<number> {
        const db = await this.dbPromise
        const id = await db.add('messages', message as Message & { roomId: number })
        // 更新咨询室的更新时间
        if (message.roomId) {
            const room = await db.get('rooms', message.roomId)
            if (room) {
                room.updatedAt = Date.now()
                await db.put('rooms', room)
            }
        }
        return id
    }

    /**
     * 获取指定咨询室的全部消息
     */
    async getRoomMessages(roomId: number): Promise<Message[]> {
        const db = await this.dbPromise
        const messages = await db
            .getAllFromIndex('messages', 'by-roomId', roomId)
        return messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    }
}

export const dbService = new DBService()
