import type { ToolResult } from './index'

/**
 * 备忘录工具 - 存储和管理咨询过程中的关键信息
 */

// 内存存储（TODO: 后续可改为持久化存储）
const store = new Map<string, string>()

/** 获取所有备忘录名称 */
export function list(): ToolResult {
    const names = Array.from(store.keys())
    console.log('[Memo.list]', names)
    return { success: true, data: names, display: null }
}

/** 读取指定备忘录 */
export function read(name: string): ToolResult {
    const content = store.get(name)
    console.log('[Memo.read]', name, '->', content ?? 'not found')
    return { success: content !== undefined, data: content ?? false, display: null }
}

/** 写入备忘录 */
export function write(name: string, content: string): ToolResult {
    store.set(name, content)
    console.log('[Memo.write]', name, ':', content)
    return { success: true, data: true, display: null }
}

/** 修改备忘录 */
export function modify(name: string, newContent: string): ToolResult {
    if (!store.has(name)) {
        console.log('[Memo.modify]', name, '- not found')
        return { success: false, data: false, display: null }
    }
    store.set(name, newContent)
    console.log('[Memo.modify]', name, ':', newContent)
    return { success: true, data: true, display: null }
}

/** 删除备忘录 */
export function remove(name: string): ToolResult {
    const existed = store.delete(name)
    console.log('[Memo.remove]', name, existed ? 'deleted' : 'not found')
    return { success: existed, data: existed, display: null }
}
