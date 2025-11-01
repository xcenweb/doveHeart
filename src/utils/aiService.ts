import OpenAI from 'openai'
import { settingService } from './settingService'
import { chatService } from './chatService'

class AiService {
    /**
     * OpenAI API client
     */
    client: OpenAI

    constructor() {
        const apiKey = settingService.get('apiKey')
        const baseURL = "https://open.bigmodel.cn/api/paas/v4/"
        this.client = new OpenAI({ apiKey, baseURL, dangerouslyAllowBrowser: true })
    }

    /**
     * Send a message to the OpenAI API and stream the response back to the client
     * @return A generator that yields chunks of the response
     */
    async* sendCallback() {
        const response = await this.client.chat.completions.create({
            model: settingService.get('model'),
            messages: chatService.local_messages.value,
            stream: true,
            temperature: 0.7,
        })

        for await (const chunk of response) {
            yield chunk
        }
    }
}

export const aiService = new AiService()
