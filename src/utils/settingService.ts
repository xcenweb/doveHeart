import { useStorage } from '@vueuse/core'

/**
 * 可选设置项
 */
export const optionsSetting = {
    theme: [
        { text: '系统', value: 'system' },
        { text: '浅色', value: 'light' },
        { text: '深色', value: 'dark' }
    ],
    language: [
        { text: '简体中文', value: 'zh' },
        { text: 'English', value: 'en' }
    ],
    updateChannel: [
        { text: '正式版', value: 'official' },
        { text: '测试版', value: 'beta' },
    ],
    providers: {
        chatglm: {
            name: 'ChatGLM',
            api: 'https://open.bigmodel.cn/api/paas/v4/',
            models: [
                { text: 'glm-4-flash', value: 'glm-4-flash' },
                { text: 'glm-4', value: 'glm-4' },
                { text: 'glm-4-plus', value: 'glm-4-plus' },
                { text: 'glm-4-air', value: 'glm-4-air' },
            ],
            defaultModel: 'glm-4-flash'
        },
        openai: {
            name: 'OpenAI',
            api: 'https://api.openai.com/v1/',
            models: [
                { text: 'GPT-4', value: 'gpt-4' },
            ],
            defaultModel: 'gpt-4'
        }
    } as Record<string, any>
}

type ValueOf<T> = T extends readonly { value: infer V }[] ? V : never

export interface AppSettings {
    theme: ValueOf<typeof optionsSetting.theme>
    language: ValueOf<typeof optionsSetting.language>
    autoCheckUpdate: boolean
    updateChannel: ValueOf<typeof optionsSetting.updateChannel>
    provider: string
    models: Record<string, string>
    apiKeys: Record<string, string>
}

/**
 * 默认设置项
 */
export const defaultSetting: AppSettings = {
    theme: 'system',
    language: 'zh',
    autoCheckUpdate: true,
    updateChannel: 'beta',
    provider: 'chatglm',
    apiKeys: { chatglm: '', openai: '' },
    models: { chatglm: 'glm-4-flash', openai: 'gpt-3.5-turbo' },
}

/**
 * 设置服务
 */
class SettingService {
    /**
     * 存储
     */
    private storage = useStorage('app-settings', defaultSetting)

    /**
     * 获取所有设置项
     * @returns 全部设置项
     */
    getAll() {
        return { ...this.storage.value }
    }

    /**
     * 获取一个设置项
     * @param key
     */
    get<K extends keyof AppSettings>(key: K) {
        if (key in this.storage.value && this.storage.value[key] !== undefined) {
            return this.storage.value[key]
        }
        return defaultSetting[key]
    }


    /**
     * 设置或更新指定设置项
     * @param key 设置项键名
     * @param value 新值
     */
    set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
        if (this.storage.value[key] === value) return
        this.storage.value[key] = value
    }



    /**
     * 重置所有设置项
     */
    reset() {
        this.storage.value = { ...defaultSetting }
    }
}

export const settingService = new SettingService()