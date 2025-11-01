import { ref } from 'vue'
import { aiService } from './aiService'

// system prompts
import thinkSingleToolV1Zh from '@/prompts/think-singleTool-v1-zh.md?raw'


/**
 * 聊天消息接口
 */
export interface Message {
    /** 角色 */
    role: 'user' | 'system' | 'assistant'
    /** 消息原始内容 */
    content: string
    /** 消息实际显示内容 */
    displayContent?: string
}

class ChatService {

    /**
     * 编辑器中文本内容
     */
    editorText = ref('')

    /**
     * 本地聊天记录
     */
    local_messages = ref<Message[]>([])


    /**
     * 消息回复状态
     */
    reply_status = ref<'ok' | 'error' | 'loading'>('ok')

    constructor() { }

    /**
     * 发送消息
     */
    async send() {
        if (!this.editorText.value.trim()) return
        if (this.local_messages.value.length == 0) this.local_messages.value.push({ role: 'system', content: thinkSingleToolV1Zh })

        // 发送用户消息并清空编辑框
        this.local_messages.value.push({ role: 'user', content: this.editorText.value })
        this.editorText.value = ''

        // 模型回复消息占位
        const replyMsg: Message = { role: 'assistant', content: '' }
        this.local_messages.value.push(replyMsg)

        try {
            this.reply_status.value = 'loading'
            const stream = aiService.sendCallback()
            for await (const chunk of stream) {
                replyMsg.content += chunk.choices[0]?.delta?.content || ''
                this.local_messages.value = [...this.local_messages.value]
            }
            this.reply_status.value = 'ok'
        } catch (error) {
            console.error('Error streaming response:', error)
            this.reply_status.value = 'error'
            replyMsg.content = '抱歉，我在回复时遇到了一些问题，请稍后再试。'
            this.local_messages.value = [...this.local_messages.value]
        }
    }
}

export const chatService = new ChatService()