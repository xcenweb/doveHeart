import { ref } from 'vue'
import OpenAI from 'openai'
import { settingService, type ModelProvider } from './settingService'
import { toolService } from './toolService'
import promptsV1 from '@/prompts/v1.md?raw'

const providerBaseURLs: Record<ModelProvider, string> = {
    chatglm: 'https://open.bigmodel.cn/api/paas/v4/',
}

export interface Message {
    role: 'user' | 'system' | 'assistant'
    content: string
    processedContent?: string
    thinking?: string
    visible?: boolean
}

class ChatService {
    editorText = ref('')
    messages = ref<Message[]>([])
    status = ref<'idle' | 'thinking' | 'error'>('idle')

    /** 发送消息 */
    async send() {
        const text = this.editorText.value.trim()
        if (!text) return

        // 初始化系统提示词
        if (this.messages.value.length === 0) {
            this.messages.value.push({ role: 'system', content: promptsV1 })
        }

        // 添加用户消息
        this.messages.value.push({ role: 'user', content: text })
        this.editorText.value = ''

        // 创建AI回复占位
        const reply: Message = { role: 'assistant', content: '' }
        this.messages.value.push(reply)

        try {
            this.status.value = 'thinking'
            await this.processToolLoop(reply)
            this.status.value = 'idle'
        } catch (error) {
            console.error('[Chat Error]', error)
            this.status.value = 'error'
            reply.processedContent = '抱歉，我在回复时遇到了一些问题，请稍后再试。'
            this.triggerUpdate()
        }
    }

    /** 工具调用循环：持续执行直到得到send结果 */
    private async processToolLoop(reply: Message) {
        let thinking = ''

        while (true) {
            const { raw, parsed, currentThinking } = await this.streamAndParse(reply, thinking)
            
            // 累积思考内容
            if (currentThinking) {
                thinking = thinking ? `${thinking}\n\n${currentThinking}` : currentThinking
                reply.thinking = thinking
            }

            // JSON未完整，结束
            if (!parsed.isComplete || !parsed.toolName) break

            // 执行工具
            const result = toolService.execute(parsed.toolName, parsed.methodName, parsed.params)
            console.log(`[Tool] ${parsed.toolName}`, result)

            // send工具：结束循环
            if (result.display) {
                reply.processedContent = result.display
                this.triggerUpdate()
                break
            }

            // 其他工具：添加隐藏消息，继续循环
            this.addHiddenMessages(raw, result.data ?? result.success)
            reply.content = ''
        }
    }

    /** 流式接收并实时解析 */
    private async streamAndParse(reply: Message, prevThinking: string) {
        let raw = ''
        let currentThinking = ''

        for await (const chunk of this.stream()) {
            raw += chunk.choices[0]?.delta?.content || ''
            reply.content = raw

            const parsed = toolService.parse(raw)

            // 实时更新think内容
            if (parsed.toolName === 'think' && parsed.params.length) {
                currentThinking = (parsed.params as string[]).join('\n')
                reply.thinking = prevThinking ? `${prevThinking}\n\n${currentThinking}` : currentThinking
            }

            // 实时更新send内容
            if (parsed.toolName === 'send' && parsed.params.length) {
                reply.processedContent = parsed.params[0] as string
            }

            this.triggerUpdate()
        }

        return { raw, parsed: toolService.parse(raw), currentThinking }
    }

    /** 添加隐藏消息（用于工具续聊） */
    private addHiddenMessages(aiResponse: string, toolResult: unknown) {
        this.messages.value.push(
            { role: 'assistant', content: aiResponse, visible: false },
            { role: 'user', content: JSON.stringify(toolResult), visible: false }
        )
        this.triggerUpdate()
    }

    /** 流式调用AI */
    private async *stream() {
        const provider = settingService.get('provider')
        const client = new OpenAI({
            apiKey: settingService.get('apiKeys')[provider],
            baseURL: providerBaseURLs[provider],
            dangerouslyAllowBrowser: true
        })

        const response = await client.chat.completions.create({
            model: settingService.get('models')[provider],
            messages: this.messages.value.map(m => ({ role: m.role, content: m.content })),
            stream: true
        })

        for await (const chunk of response) yield chunk
    }

    /** 触发Vue响应式更新 */
    private triggerUpdate() {
        this.messages.value = [...this.messages.value]
    }
}

export const chatService = new ChatService()
