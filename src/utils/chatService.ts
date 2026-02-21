import { ref } from 'vue'
import OpenAI from 'openai'
import { type ToolCall } from './toolService'
import { settingService, optionsSetting } from './settingService'

import systemPrompt from '@/prompts/tool-v1.md?raw'

export interface Message {
    id?: number
    role: 'user' | 'system' | 'assistant'
    content: string
    toolCall: ToolCall | []
    status?: 'loading' | 'success' | 'error'
    createdAt?: number
}

class ChatService {
    editbox = ref('')
    messages = ref<Message[]>([])

    /**
     * 创建一个咨询会话
     */
    create() {
        this.messages.value = []
    }

    /**
     * 处理并获取实际消息列表
     */
    getRealMessages() {
        var msgs = this.messages.value
            .filter(m => !(m.role === 'assistant' && m.content === ''))
            .map(m => ({ role: m.role, content: m.content }))
        msgs.unshift({ role: 'system', content: systemPrompt as string })
        return msgs
    }

    /**
     * 获取回复
     * @param text 消息内容
     * @param toolcall 是否是工具调用消息
     */
    async getReply(text: string) {
        this.editbox.value = ''

        // 添加用户消息和助手占位消息
        this.messages.value.push(
            { role: 'user', content: text, toolCall: [], createdAt: Date.now() },
            { role: 'assistant', content: '', toolCall: [], status: 'loading' }
        )

        // 修改占位消息
        const reply = this.messages.value[this.messages.value.length - 1]
        try {
            const response = await this.getaiback()
            reply.content = response.choices[0]?.message?.content || ''
            reply.status = 'success'
            reply.createdAt = Date.now()
        } catch {
            reply.status = 'error'
            reply.content = '抱歉，我在回复时遇到了一些问题，请稍后再试。'
        } finally {
            console.log(this.messages.value)
        }
    }

    /**
     * 调用AI
     */
    private async getaiback() {
        const provider = settingService.get('provider')
        const client = new OpenAI({
            apiKey: settingService.get('apiKeys')?.[provider] || '',
            baseURL: optionsSetting.providers[provider]?.api || '',
            dangerouslyAllowBrowser: true
        })

        return client.chat.completions.create({
            model: settingService.get('models')?.[provider] || '',
            messages: this.getRealMessages(),
            temperature: 0.7,
            top_p: 0.7
        })
    }
}

export const chatService = new ChatService()