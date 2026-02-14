import { ref } from 'vue'
import OpenAI from 'openai'
import { settingService, optionsSetting } from './settingService'
import { dbService } from './dbService'
import systemPrompt from '@/prompts/tool-v1.md?raw'

export interface Message {
    id?: number
    roomId?: number
    timestamp?: number
    status?: 'loading' | 'success' | 'error'
    role: 'user' | 'system' | 'assistant'
    content: string
}

export interface ChatRoom {
    id?: number
    name: string
    createdAt: number
    updatedAt: number
    isPinned?: boolean
}

class ChatService {
    editorText = ref('')
    messages = ref<Message[]>([])
    currentRoomId = ref<number | null>(null)

    /** 检查是否为草稿状态 */
    private isDraft(roomId: number | null): boolean {
        return roomId === null || roomId === -1
    }

    /** 确保消息列表以 system 提示词开头 */
    private ensureSystemPrompt() {
        if (this.messages.value.length === 0 || this.messages.value[0].role !== 'system') {
            this.messages.value.unshift({ role: 'system', content: systemPrompt })
        }
    }

    /** 获取用于AI请求的消息列表（过滤空内容的助手消息） */
    private getMessagesForAI() {
        return this.messages.value
            .filter(m => !(m.role === 'assistant' && m.content === ''))
            .map(m => ({ role: m.role, content: m.content }))
    }

    /**
     * 切换到指定咨询室
     */
    async switchRoom(roomId: number | null) {
        this.currentRoomId.value = roomId
        this.messages.value = []

        if (roomId !== null) {
            const history = await dbService.getRoomMessages(roomId)
            if (history.length > 0) {
                this.messages.value = history
            }
            this.ensureSystemPrompt()
        }
    }

    /**
     * 创建新咨询室（草稿状态，未写入数据库）
     */
    createRoom() {
        this.currentRoomId.value = -1
        this.messages.value = []
    }

    /**
     * 获取所有咨询室
     */
    getRooms(): Promise<ChatRoom[]> {
        return dbService.getAllRooms()
    }

    /**
     * 重命名咨询室
     */
    renameRoom(roomId: number, name: string): Promise<void> {
        return dbService.updateRoomName(roomId, name)
    }

    /**
     * 切换咨询室置顶状态
     */
    togglePinRoom(roomId: number, isPinned: boolean): Promise<void> {
        return dbService.setRoomPinned(roomId, isPinned)
    }

    /**
     * 删除咨询室
     */
    async deleteRoom(roomId: number) {
        await dbService.deleteRoom(roomId)
        if (this.currentRoomId.value === roomId) {
            await this.switchRoom(null)
        }
    }

    /**
     * 获取回复
     */
    async getReply(text: string) {
        const oldRoomId = this.currentRoomId.value

        // 如果没有有效咨询室（null 或草稿状态），创建真正的咨询室
        if (this.isDraft(oldRoomId)) {
            const roomId = await dbService.createRoom(text.slice(0, 20))
            this.currentRoomId.value = roomId
        }

        const roomId = this.currentRoomId.value!

        this.ensureSystemPrompt()
        this.editorText.value = ''

        // 添加用户消息和助手占位消息
        this.messages.value.push(
            { role: 'user', content: text },
            { role: 'assistant', content: '', status: 'loading' }
        )

        const reply = this.messages.value[this.messages.value.length - 1]

        try {
            await dbService.addMessage({ roomId, role: 'user', content: text, timestamp: Date.now() })

            for await (const chunk of this.stream()) {
                reply.content += chunk.choices[0]?.delta?.content || ''
            }
            reply.status = 'success'
        } catch {
            reply.status = 'error'
            reply.content = '抱歉，我在回复时遇到了一些问题，请稍后再试。'
        }

        await dbService.addMessage({
            roomId,
            role: 'assistant',
            content: reply.content,
            timestamp: Date.now(),
            status: reply.status
        })
    }

    /**
     * 流式调用AI
     */
    private async *stream() {
        const provider = settingService.get('provider')
        const client = new OpenAI({
            apiKey: settingService.get('apiKeys')?.[provider] || '',
            baseURL: optionsSetting.providers[provider]?.api || '',
            dangerouslyAllowBrowser: true
        })

        const response = await client.chat.completions.create({
            model: settingService.get('models')?.[provider] || '',
            messages: this.getMessagesForAI(),
            stream: true
        })

        for await (const chunk of response) yield chunk
    }
}

export const chatService = new ChatService()
