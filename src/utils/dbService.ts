import { ref } from 'vue'

export interface ChatMessage {
    id?: number
    roomId: number
    role: 'user' | 'system' | 'assistant'
    content: string
    timestamp: number
}

export interface ChatRoom {
    id?: number
    name: string
    createdAt: number
    updatedAt: number
    isPinned?: boolean
}

const DB_NAME = 'doveheart-chat'
const DB_VERSION = 2
const ROOM_STORE_NAME = 'rooms'
const MESSAGE_STORE_NAME = 'messages'

class DBService {
    private db: IDBDatabase | null = null
    private dbReady = ref(false)

    /**
     * 初始化数据库
     */
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => {
                this.db = request.result
                this.dbReady.value = true
                resolve()
            }

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result

                // 创建咨询室表
                if (!db.objectStoreNames.contains(ROOM_STORE_NAME)) {
                    const roomStore = db.createObjectStore(ROOM_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    })
                    roomStore.createIndex('updatedAt', 'updatedAt', { unique: false })
                }

                // 创建消息表
                if (!db.objectStoreNames.contains(MESSAGE_STORE_NAME)) {
                    const messageStore = db.createObjectStore(MESSAGE_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    })
                    messageStore.createIndex('roomId', 'roomId', { unique: false })
                    messageStore.createIndex('timestamp', 'timestamp', { unique: false })
                }
            }
        })
    }

    /**
     * 创建咨询室
     */
    async createRoom(name: string): Promise<number> {
        await this.init()
        const now = Date.now()
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([ROOM_STORE_NAME], 'readwrite')
            const store = transaction.objectStore(ROOM_STORE_NAME)
            const request = store.add({
                name,
                createdAt: now,
                updatedAt: now
            })

            request.onsuccess = () => resolve(request.result as number)
            request.onerror = () => reject(request.error)
        })
    }

    /**
     * 获取所有咨询室
     */
    async getAllRooms(): Promise<ChatRoom[]> {
        await this.init()
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([ROOM_STORE_NAME], 'readonly')
            const store = transaction.objectStore(ROOM_STORE_NAME)
            const request = store.getAll()

            request.onsuccess = () => {
                const rooms = (request.result as ChatRoom[]).sort((a, b) => {
                    // 置顶的在前
                    if (a.isPinned !== b.isPinned) {
                        return a.isPinned ? -1 : 1
                    }
                    // 然后按更新时间
                    return b.updatedAt - a.updatedAt
                })
                resolve(rooms)
            }
            request.onerror = () => reject(request.error)
        })
    }

    /**
     * 置顶咨询室
     */
    async pinRoom(id: number): Promise<void> {
        await this.updateRoomField(id, 'isPinned', true)
    }

    /**
     * 取消置顶
     */
    async unpinRoom(id: number): Promise<void> {
        await this.updateRoomField(id, 'isPinned', false)
    }

    /**
     * 更新咨询室指定字段
     */
    private async updateRoomField(id: number, field: keyof ChatRoom, value: any): Promise<void> {
        await this.init()
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([ROOM_STORE_NAME], 'readwrite')
            const store = transaction.objectStore(ROOM_STORE_NAME)
            const getRequest = store.get(id)

            getRequest.onsuccess = () => {
                const room = getRequest.result as ChatRoom
                if (room) {
                    (room as any)[field] = value
                    room.updatedAt = Date.now()
                    const putRequest = store.put(room)
                    putRequest.onsuccess = () => resolve()
                    putRequest.onerror = () => reject(putRequest.error)
                } else {
                    resolve()
                }
            }
            getRequest.onerror = () => reject(getRequest.error)
        })
    }

    /**
     * 获取咨询室
     */
    async getRoom(id: number): Promise<ChatRoom | undefined> {
        await this.init()
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([ROOM_STORE_NAME], 'readonly')
            const store = transaction.objectStore(ROOM_STORE_NAME)
            const request = store.get(id)

            request.onsuccess = () => resolve(request.result as ChatRoom | undefined)
            request.onerror = () => reject(request.error)
        })
    }

    /**
     * 更新咨询室名称
     */
    async updateRoomName(id: number, name: string): Promise<void> {
        await this.init()
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([ROOM_STORE_NAME], 'readwrite')
            const store = transaction.objectStore(ROOM_STORE_NAME)
            const getRequest = store.get(id)

            getRequest.onsuccess = () => {
                const room = getRequest.result as ChatRoom
                if (room) {
                    room.name = name
                    room.updatedAt = Date.now()
                    const putRequest = store.put(room)
                    putRequest.onsuccess = () => resolve()
                    putRequest.onerror = () => reject(putRequest.error)
                } else {
                    resolve()
                }
            }
            getRequest.onerror = () => reject(getRequest.error)
        })
    }

    /**
     * 删除咨询室（同时删除所有消息）
     */
    async deleteRoom(id: number): Promise<void> {
        await this.init()
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([ROOM_STORE_NAME, MESSAGE_STORE_NAME], 'readwrite')

            // 删除咨询室
            const roomStore = transaction.objectStore(ROOM_STORE_NAME)
            roomStore.delete(id)

            // 删除该咨询室的所有消息
            const messageStore = transaction.objectStore(MESSAGE_STORE_NAME)
            const index = messageStore.index('roomId')
            const request = index.openCursor(IDBKeyRange.only(id))

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursor>).result
                if (cursor) {
                    cursor.delete()
                    cursor.continue()
                }
            }

            transaction.oncomplete = () => resolve()
            transaction.onerror = () => reject(transaction.error)
        })
    }

    /**
     * 添加消息
     */
    async addMessage(message: Omit<ChatMessage, 'id'>): Promise<number> {
        await this.init()
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([MESSAGE_STORE_NAME, ROOM_STORE_NAME], 'readwrite')
            const store = transaction.objectStore(MESSAGE_STORE_NAME)
            const request = store.add(message)

            request.onsuccess = async () => {
                const id = request.result as number
                // 更新咨询室的更新时间
                const roomStore = transaction.objectStore(ROOM_STORE_NAME)
                const roomGetRequest = roomStore.get(message.roomId)
                roomGetRequest.onsuccess = () => {
                    const room = roomGetRequest.result as ChatRoom
                    if (room) {
                        room.updatedAt = Date.now()
                        roomStore.put(room)
                    }
                }
                resolve(id)
            }
            request.onerror = () => reject(request.error)
        })
    }

    /**
     * 更新消息
     */
    async updateMessage(id: number, content: string): Promise<void> {
        await this.init()
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([MESSAGE_STORE_NAME], 'readwrite')
            const store = transaction.objectStore(MESSAGE_STORE_NAME)
            const getRequest = store.get(id)

            getRequest.onsuccess = () => {
                const message = getRequest.result as ChatMessage
                if (message) {
                    message.content = content
                    const putRequest = store.put(message)
                    putRequest.onsuccess = () => resolve()
                    putRequest.onerror = () => reject(putRequest.error)
                } else {
                    resolve()
                }
            }
            getRequest.onerror = () => reject(getRequest.error)
        })
    }

    /**
     * 获取咨询室最新一条消息
     */
    async getLatestMessage(roomId: number): Promise<ChatMessage | undefined> {
        await this.init()
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([MESSAGE_STORE_NAME], 'readonly')
            const store = transaction.objectStore(MESSAGE_STORE_NAME)
            const index = store.index('roomId')
            const request = index.openCursor(IDBKeyRange.only(roomId), 'prev')

            request.onsuccess = () => {
                const cursor = request.result
                if (cursor) {
                    resolve(cursor.value as ChatMessage)
                } else {
                    resolve(undefined)
                }
            }
            request.onerror = () => reject(request.error)
        })
    }

    /**
     * 获取指定咨询室的所有消息
     */
    async getRoomMessages(roomId: number): Promise<ChatMessage[]> {
        await this.init()
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([MESSAGE_STORE_NAME], 'readonly')
            const store = transaction.objectStore(MESSAGE_STORE_NAME)
            const index = store.index('roomId')
            const request = index.getAll(IDBKeyRange.only(roomId))

            request.onsuccess = () => {
                const messages = (request.result as ChatMessage[]).sort((a, b) => a.timestamp - b.timestamp)
                resolve(messages)
            }
            request.onerror = () => reject(request.error)
        })
    }
}

export const dbService = new DBService()
