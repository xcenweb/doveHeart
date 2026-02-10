import type { ToolResult } from './index'

/**
 * 思考工具 - 记录内部思考过程
 */
export function think(thoughts: string[]): ToolResult {
    const thinking = thoughts.join('\n')
    console.log('[Think]', thinking)
    return { success: true, display: null, data: thinking }
}
