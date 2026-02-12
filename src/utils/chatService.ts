import { ref } from 'vue'
import OpenAI from 'openai'
import { settingService, optionsSetting } from './settingService'
import { toolService } from './toolService'
import systemPrompt from '@/prompts/v2.md?raw'

export interface ToolCall {
    name: string
    method?: string
    params: unknown[]
    result: unknown
    timestamp: number
}

export interface MessageSelectOptions {
    mode: 'single' | 'multi'
    options: string[]
    answered?: boolean
    selected?: string[]
}

export interface Message {
    role: 'user' | 'system' | 'assistant'
    content: string
    processedContent?: string
    toolCalls?: ToolCall[]
    visible?: boolean
    selectOptions?: MessageSelectOptions
}

class ChatService {
    editorText = ref('')
    messages = ref<Message[]>([])
    status = ref<'idle' | 'thinking' | 'error'>('idle')

    /** 发送消息 */
    async send() {
        const text = this.editorText.value.trim()
        if (!text) return

        if (this.messages.value.length === 0) {
            this.messages.value.push({ role: 'system', content: systemPrompt })
        }

        this.editorText.value = ''
        await this.processUserInput(text)
    }

    /** 处理用户选择 */
    async selectOption(selected: string[]) {
        const lastSelect = [...this.messages.value].reverse().find(m => m.selectOptions && !m.selectOptions.answered)
        if (lastSelect?.selectOptions) {
            lastSelect.selectOptions.answered = true
            lastSelect.selectOptions.selected = selected
        }
        await this.processUserInput(selected.join('、'))
    }

    /** 统一处理用户输入并触发AI回复 */
    private async processUserInput(text: string) {
        this.messages.value.push({ role: 'user', content: text })
        this.messages.value.push({ role: 'assistant', content: '' } as Message)
        // 从响应式数组取代理引用，确保属性修改触发Vue响应式更新
        const reply = this.messages.value[this.messages.value.length - 1]

        try {
            this.status.value = 'thinking'
            await this.processToolLoop(reply)
            this.status.value = 'idle'
        } catch (error) {
            console.error('[Chat Error]', error)
            this.status.value = 'error'
            reply.processedContent = '抱歉，我在回复时遇到了一些问题，请稍后再试。'
        }
    }

    /** 工具调用循环：持续执行直到得到send结果 */
    private async processToolLoop(reply: Message) {
        reply.toolCalls = []

        while (true) {
            const { raw, parsed } = await this.streamAndParse(reply)

            // JSON未完整，结束
            if (!parsed.isComplete || !parsed.toolName) break

            // 执行工具
            const result = toolService.execute(parsed.toolName, parsed.methodName, parsed.params)
            console.log(`[Tool] ${parsed.toolName}`, result)

            // 记录工具调用
            reply.toolCalls.push({
                name: parsed.toolName,
                method: parsed.methodName || undefined,
                params: parsed.params,
                result: result.data ?? result.success,
                timestamp: Date.now()
            })

            if (result.display) {
                reply.processedContent = result.display
                if (parsed.toolName === 'select' && result.data) {
                    const selectData = result.data as { mode: 'single' | 'multi', options: string[] }
                    reply.selectOptions = {
                        mode: selectData.mode,
                        options: selectData.options
                    }
                }
                break
            }

            this.addHiddenMessages(raw, result.data ?? result.success)
            reply.content = ''
        }
    }

    /** 流式接收并实时解析 */
    private async streamAndParse(reply: Message) {
        let raw = ''

        for await (const chunk of this.stream()) {
            raw += chunk.choices[0]?.delta?.content || ''
            reply.content = raw  // 实时更新原始内容

            const parsed = toolService.parse(raw)

            // 实时更新处理后的内容
            if ((parsed.toolName === 'send' || parsed.toolName === 'select') && parsed.params.length) {
                reply.processedContent = parsed.params[0] as string
            }
        }

        return { raw, parsed: toolService.parse(raw) }
    }

    /** 添加隐藏消息（用于工具续聊） */
    private addHiddenMessages(aiResponse: string, toolResult: unknown) {
        this.messages.value.push(
            { role: 'assistant', content: aiResponse, visible: false },
            { role: 'user', content: JSON.stringify(toolResult), visible: false }
        )
    }

    /** 流式调用AI */
    private async *stream() {
        const provider = settingService.get('provider')
        const client = new OpenAI({
            apiKey: settingService.get('apiKeys')?.[provider] || '',
            baseURL: optionsSetting.providers[provider]?.api || '',
            dangerouslyAllowBrowser: true
        })

        const response = await client.chat.completions.create({
            model: settingService.get('models')?.[provider] || 'glm-4-flash',
            messages: this.messages.value.map(m => ({ role: m.role, content: m.content })),
            stream: true
        })

        for await (const chunk of response) yield chunk
    }

}

export const chatService = new ChatService()
