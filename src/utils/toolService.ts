import { thinkTool, memoTool, sendTool, selectTool, type ToolResult } from './tools'

class ToolService {

    /**
     * 解析JSON字符串（支持完整或流式累积）
     * @param input 输入字符串
     * @returns 解析结果
     */
    parse(input: string) {
        const isComplete = this.isJsonComplete(input)
        const json = this.completeJson(input)
        const { toolName, methodName } = this.extractTool(json)
        const params = this.extractParams(json, toolName, methodName)
        return { toolName, methodName, params, isComplete }
    }

    /**
     * 执行工具调用
     * @param toolName 工具名称
     * @param methodName 方法名称
     * @param params 参数
     * @returns 调用结果
     */
    execute(toolName: string, methodName: string | null, params: unknown[]): ToolResult {
        console.log(`[Tool] ${methodName ? `${toolName}.${methodName}` : toolName}`, params)

        switch (toolName) {
            case 'think':
                return thinkTool.think(params as string[])
            case 'memo':
                return this.executeMemo(methodName, params)
            case 'send':
                return sendTool.send(params[0] as string)
            case 'select':
                return this.executeSelect(methodName, params)
            default:
                return { success: false, display: `未知工具: ${toolName}` }
        }
    }

    /**
     * 执行记忆工具调用
     * @param method 方法名称
     * @param params 参数
     * @returns 调用结果
     */
    private executeMemo(method: string | null, params: unknown[]): ToolResult {
        const [p1, p2] = params as [string, string]
        switch (method) {
            case 'list': return memoTool.list()
            case 'read': return memoTool.read(p1)
            case 'write': return memoTool.write(p1, p2)
            case 'modify': return memoTool.modify(p1, p2)
            case 'remove': return memoTool.remove(p1)
            default: return { success: false, display: `未知方法: memo.${method}` }
        }
    }

    /**
     * 执行选择工具调用
     * @param method 方法名称
     * @param params 参数
     * @returns 调用结果
     */
    private executeSelect(method: string | null, params: unknown[]): ToolResult {
        const [prompt, options] = params as [string, string[]]
        switch (method) {
            case 'multi': return selectTool.multi(prompt, options)
            case 'single': return selectTool.single(prompt, options)
            default: return selectTool.single(prompt, options)
        }
    }

    /**
     * 判断JSON字符串是否完整
     * @param str JSON字符串
     * @returns 是否完整
     */
    private isJsonComplete(str: string): boolean {
        try { JSON.parse(str); return true } catch { return false }
    }

    /**
     * 完善JSON字符串
     * @param partial 不完整的JSON字符串
     * @returns 完善后的JSON字符串
     */
    private completeJson(partial: string): string {
        if (!partial.trim()) return '{}'

        const stack: ('{' | '[')[] = []
        let inString = false, escape = false

        for (const c of partial) {
            if (escape) { escape = false; continue }
            if (c === '"') inString = !inString
            else if (c === '\\') escape = true
            else if (!inString) {
                if (c === '{' || c === '[') stack.push(c)
                else if (c === '}' && stack[stack.length - 1] === '{') stack.pop()
                else if (c === ']' && stack[stack.length - 1] === '[') stack.pop()
            }
        }

        let result = partial
        if (inString) result += '"'
        while (stack.length) result += stack.pop() === '{' ? '}' : ']'
        if (!result.startsWith('{')) result = '{' + result
        if (!result.endsWith('}')) result += '}'
        return result
    }

    /**
     * 提取工具名称和方法名称
     * @param json JSON字符串
     * @returns 工具名称和方法名称
     */
    private extractTool(json: string) {
        try {
            const key = Object.keys(JSON.parse(json))[0]
            if (!key) return { toolName: null, methodName: null }
            const [tool, method] = key.split('.', 2)
            return { toolName: tool, methodName: method || null }
        } catch {
            const match = json.match(/"([^"]+)"/)
            if (!match) return { toolName: null, methodName: null }
            const [tool, method] = match[1].split('.', 2)
            return { toolName: tool, methodName: method || null }
        }
    }

    /**
     * 提取参数
     * @param json JSON字符串
     * @param tool 工具名称
     * @param method 方法名称
     * @returns 参数
     */
    private extractParams(json: string, tool: string | null, method: string | null) {
        if (!tool) return []
        try {
            const key = method ? `${tool}.${method}` : tool
            const value = JSON.parse(json)[key]
            return Array.isArray(value) ? value : value !== undefined ? [value] : []
        } catch { return [] }
    }
}

export const toolService = new ToolService()
