import { useStorage } from '@vueuse/core'

/**
 * AI模型供应商类型
 */
export type ModelProvider = 'chatglm'

/**
 * 供应商配置
 */
export const providerOptions: { text: string; value: ModelProvider }[] = [
    { text: 'ChatGLM (智谱)', value: 'chatglm' },
]

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
        { text: '简体中文', value: 'Chinese' },
        { text: 'English', value: 'English' }
    ],
    updateChannel: [
        { text: '正式版', value: 'official' },
        { text: '测试版', value: 'beta' },
    ],
    models: {
        chatglm: [
            { text: 'glm-4-flash', value: 'glm-4-flash' },
            { text: 'glm-4', value: 'glm-4' },
            { text: 'glm-4-plus', value: 'glm-4-plus' },
            { text: 'glm-4-air', value: 'glm-4-air' },
        ],
    } as Record<ModelProvider, { text: string; value: string }[]>
}

// 获取可选设置项的 value
type ValueOf<T> = T extends readonly { value: infer V }[] ? V : never

/**
 * 各供应商的API密钥存储结构
 */
export type ApiKeys = Record<ModelProvider, string>

/**
 * 各供应商选择的模型存储结构
 */
export type SelectedModels = Record<ModelProvider, string>

export interface AppSettings {
    theme: ValueOf<typeof optionsSetting.theme>
    language: ValueOf<typeof optionsSetting.language>
    autoCheckUpdate: boolean
    updateChannel: ValueOf<typeof optionsSetting.updateChannel>
    /** 当前选择的供应商 */
    provider: ModelProvider
    /** 各供应商的API密钥 */
    apiKeys: ApiKeys
    /** 各供应商选择的模型 */
    models: SelectedModels
}

/**
 * 默认API密钥配置
 */
const defaultApiKeys: ApiKeys = {
    chatglm: '',
}

/**
 * 默认模型配置
 */
const defaultModels: SelectedModels = {
    chatglm: 'glm-4-flash',
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
    apiKeys: { ...defaultApiKeys },
    models: { ...defaultModels },
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
        if (key in this.storage.value) {
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
     * 获取当前供应商
     */
    getCurrentProvider(): ModelProvider {
        return this.storage.value.provider || 'chatglm'
    }

    /**
     * 设置指定供应商的API密钥
     * @param provider 供应商
     * @param apiKey API密钥
     */
    setApiKey(provider: ModelProvider, apiKey: string): void {
        if (!this.storage.value.apiKeys) {
            this.storage.value.apiKeys = { ...defaultApiKeys }
        }
        this.storage.value.apiKeys[provider] = apiKey
    }

    /**
     * 设置指定供应商的模型
     * @param provider 供应商
     * @param model 模型
     */
    setModel(provider: ModelProvider, model: string): void {
        if (!this.storage.value.models) {
            this.storage.value.models = { ...defaultModels }
        }
        this.storage.value.models[provider] = model
    }

    /**
     * 重置所有设置项
     */
    reset() {
        this.storage.value = { ...defaultSetting, apiKeys: { ...defaultApiKeys }, models: { ...defaultModels } }
    }
}

export const settingService = new SettingService()