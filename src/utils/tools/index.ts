/**
 * 工具集统一导出
 */

export * as thinkTool from './think'
export * as memoTool from './memo'
export * as sendTool from './send'

// 工具结果通用接口
export interface ToolResult {
    success: boolean
    data?: unknown
    display: string | null
    /** 思考内容（仅think工具） */
    thinking?: string
}
