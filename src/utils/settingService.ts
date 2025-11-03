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
        ],
    }
}

// 获取可选设置项的 value
type ValueOf<T> = T extends readonly { value: infer V }[] ? V : never
export interface AppSettings {
    theme: ValueOf<typeof optionsSetting.theme>
    language: ValueOf<typeof optionsSetting.language>
    autoCheckUpdate: boolean
    updateChannel: ValueOf<typeof optionsSetting.updateChannel>
    apiKey: string
    model: string
}

/**
 * 默认设置项
 */
export const defaultSetting: AppSettings = {
    theme: 'system',
    language: 'zh',
    autoCheckUpdate: true,
    updateChannel: 'beta',
    apiKey: '',
    model: 'glm-4-flash',
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
     * 重置所有设置项
     */
    reset() {
        this.storage.value = { ...defaultSetting }
    }
}

export const settingService = new SettingService()