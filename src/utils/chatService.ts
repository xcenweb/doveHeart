import { ref } from 'vue'
import OpenAI from 'openai'
import { settingService, optionsSetting } from './settingService'
import { dbService, type ChatRoom } from './dbService'
import systemPrompt from '@/prompts/tool-v2.md?raw'

export interface Message {
    role: 'user' | 'system' | 'assistant'
    content: string
}

class ChatService {
    editorText = ref('')
    messages = ref<Message[]>([])
    status = ref<'ready' | 'loading' | 'error'>('ready')
    currentRoomId = ref<number | null>(null)

    /**
     * 切换到指定咨询室
     */
    async switchRoom(roomId: number | null) {
        this.currentRoomId.value = roomId
        this.messages.value = []
        this.status.value = 'ready'

        if (roomId !== null) {
            await this.loadRoomHistory(roomId)
        }
    }

    /**
     * 创建新咨询室（草稿状态，未写入数据库）
     */
    createRoom() {
        this.currentRoomId.value = -1  // -1 表示草稿状态
        this.messages.value = []
        this.status.value = 'ready'
    }

    /**
     * 获取所有咨询室
     */
    async getRooms(): Promise<ChatRoom[]> {
        return await dbService.getAllRooms()
    }

    /**
     * 重命名咨询室
     */
    async renameRoom(roomId: number, name: string) {
        await dbService.updateRoomName(roomId, name)
    }

    /**
     * 置顶咨询室
     */
    async pinRoom(roomId: number) {
        await dbService.pinRoom(roomId)
    }

    /**
     * 取消置顶
     */
    async unpinRoom(roomId: number) {
        await dbService.unpinRoom(roomId)
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
     * 加载指定咨询室的历史消息
     */
    async loadRoomHistory(roomId: number) {
        const history = await dbService.getRoomMessages(roomId)
        if (history.length > 0) {
            this.messages.value = history
                .filter(m => m.role !== 'system')
                .map(m => ({ role: m.role, content: m.content }))
        }
    }

    /**
     * 获取回复
     */
    async getReply(text: string) {
        // 如果没有有效咨询室（null 或草稿状态 -1），创建真正的咨询室
        if (this.currentRoomId.value === null || this.currentRoomId.value === -1) {
            const roomId = await dbService.createRoom(text.slice(0, 20))
            this.currentRoomId.value = roomId
        }

        const roomId = this.currentRoomId.value!

        // 仅在内存中添加 system prompt，不存储到数据库（避免重复和缓存问题）
        if (this.messages.value.length === 0 || this.messages.value[0].role !== 'system') {
            this.messages.value.unshift({ role: 'system', content: systemPrompt })
        }

        this.editorText.value = ''
        this.messages.value.push({ role: 'user', content: text })
        await dbService.addMessage({ roomId, role: 'user', content: text, timestamp: Date.now() })

        const assistantMessage: Message = { role: 'assistant', content: '' }
        this.messages.value.push(assistantMessage)
        const assistantDbId = await dbService.addMessage({ roomId, role: 'assistant', content: '', timestamp: Date.now() })

        this.status.value = 'loading'
        const reply = this.messages.value[this.messages.value.length - 1]

        try {
            for await (const chunk of this.stream()) {
                const content = chunk.choices[0]?.delta?.content || ''
                reply.content += content
            }
            await dbService.updateMessage(assistantDbId, reply.content)
            this.status.value = 'ready'
        } catch (error) {
            this.status.value = 'error'
            console.error(error)
            reply.content = '抱歉，我在回复时遇到了一些问题，请稍后再试。'
        }
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
            messages: this.messages.value.map(m => ({ role: m.role, content: m.content })),
            stream: true
        })

        for await (const chunk of response) yield chunk
    }

}

export const chatService = new ChatService()
