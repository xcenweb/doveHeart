import { ref } from 'vue'

/**
 * 对话框类型
 */
export type DialogType = 'alert' | 'confirm' | 'prompt'

/**
 * 对话框配置接口
 */
export interface DialogConfig {
    /** 对话框类型 */
    type: DialogType
    /** 标题 */
    title: string
    /** 内容文本 */
    text?: string
    /** 输入框默认值（prompt 类型用） */
    defaultValue?: string
    /** 输入框占位符（prompt 类型用） */
    placeholder?: string
    /** 确认按钮文本 */
    confirmText?: string
    /** 取消按钮文本 */
    cancelText?: string
    /** 确认按钮颜色 */
    color?: string
}

/**
 * 对话框结果
 */
export interface DialogResult {
    /** 是否确认 */
    confirmed: boolean
    /** 输入值（prompt 类型用） */
    value?: string
}

/**
 * 对话框状态管理
 */
class DialogService {
    /** 是否显示对话框 */
    public visible = ref(false)

    /** 对话框配置 */
    public config = ref<DialogConfig>({
        type: 'alert',
        title: ''
    })

    /** 输入值 */
    public inputValue = ref('')

    /** Promise resolve 函数 */
    private resolve: ((result: DialogResult) => void) | null = null

    /**
     * 显示对话框
     */
    private show(config: DialogConfig): Promise<DialogResult> {
        this.config.value = config
        this.inputValue.value = config.defaultValue || ''
        this.visible.value = true

        return new Promise((resolve) => {
            this.resolve = resolve
        })
    }

    /**
     * 确认
     */
    confirm(): void {
        this.visible.value = false
        if (this.resolve) {
            this.resolve({
                confirmed: true,
                value: this.inputValue.value
            })
            this.resolve = null
        }
    }

    /**
     * 取消
     */
    cancel(): void {
        this.visible.value = false
        if (this.resolve) {
            this.resolve({
                confirmed: false
            })
            this.resolve = null
        }
    }

    /**
     * 警告对话框
     */
    alert(title: string, text?: string): Promise<DialogResult> {
        return this.show({
            type: 'alert',
            title,
            text
        })
    }

    /**
     * 确认对话框
     */
    confirmDialog(title: string, text?: string): Promise<DialogResult> {
        return this.show({
            type: 'confirm',
            title,
            text
        })
    }

    /**
     * 输入对话框
     */
    prompt(title: string, defaultValue = '', placeholder = ''): Promise<DialogResult> {
        return this.show({
            type: 'prompt',
            title,
            defaultValue,
            placeholder
        })
    }
}

// 创建全局单例实例
const dialogService = new DialogService()

/**
 * 获取全局对话框服务实例
 */
export function useDialog(): DialogService {
    return dialogService
}

export default dialogService
