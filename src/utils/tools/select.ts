import type { ToolResult } from './index'

export interface SelectData {
    mode: 'single' | 'multi'
    options: string[]
}

/** 单选 */
export function single(prompt: string, options: string[]): ToolResult {
    return createResult('single', prompt, options)
}

/** 多选 */
export function multi(prompt: string, options: string[]): ToolResult {
    return createResult('multi', prompt, options)
}

function createResult(mode: SelectData['mode'], prompt: string, options: string[]): ToolResult {
    console.log(`[Select${mode === 'multi' ? '.multi' : ''}]`, prompt, options)
    return { success: true, display: prompt, data: { mode, options } }
}
