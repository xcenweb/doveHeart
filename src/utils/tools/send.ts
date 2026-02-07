import type { ToolResult } from './index'

/**
 * 发送消息工具 - 向用户发送消息
 */
export function send(message: string): ToolResult {
    console.log('[Send]', message)
    return { success: true, display: message }
}
