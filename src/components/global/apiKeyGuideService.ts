import { ref } from 'vue'
import { settingService } from '@/utils/settingService'

/**
 * ApiKeyGuide 服务
 * 用于全局控制 API Key 引导弹窗
 */
class ApiKeyGuideService {
    /** 是否显示弹窗 */
    public visible = ref(false)

    /** 回调函数 */
    private onCompleteCallback: (() => void) | null = null

    /**
     * 检查是否需要显示 ApiKeyGuide 弹窗（初始化引导）
     * 如果未配置 API Key 则自动显示
     */
    check(onComplete?: () => void): void {
        const settings = settingService.getAll()
        const apiKey = settings.apiKeys?.[settings.provider] || ''
        if (!apiKey) {
            this.show(onComplete)
        } else if (onComplete) {
            // 已配置密钥也执行回调
            onComplete()
        }
    }

    /**
     * 显示 ApiKeyGuide 弹窗
     * @param onComplete - 配置完成后的回调
     */
    show(onComplete?: () => void): void {
        this.onCompleteCallback = onComplete || null
        this.visible.value = true
    }

    /**
     * 隐藏弹窗
     */
    hide(): void {
        this.visible.value = false
    }

    /**
     * 配置完成时的回调
     */
    notifyComplete(): void {
        if (this.onCompleteCallback) {
            this.onCompleteCallback()
            this.onCompleteCallback = null
        }
    }
}

// 创建全局单例实例
const apiKeyGuideService = new ApiKeyGuideService()

/**
 * 获取全局 ApiKeyGuide 服务实例
 */
export function useApiKeyGuide(): ApiKeyGuideService {
    return apiKeyGuideService
}

export default apiKeyGuideService
