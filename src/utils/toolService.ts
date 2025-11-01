/**
 * 工具服务类，用于解析JSON字符串提取工具名、方法名和参数
 */
class ToolService {
    /**
     * 解析输入的JSON字符串
     * @param input 输入的JSON字符串（支持完整或流式累积的字符串）
     * @returns 解析结果
     */
    parse(input: string): {
        toolName: string | null;
        methodName: string | null;
        params: any[];
        isComplete: boolean;
    } {
        const isComplete = this.isJsonComplete(input);
        const completedJson = this.completeJson(input);
        const { toolName, methodName } = this.extractTool(completedJson);
        const params = this.extractParams(completedJson, toolName, methodName);

        return { toolName, methodName, params, isComplete };
    }

    /** 检查JSON是否完整 */
    private isJsonComplete(str: string): boolean {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    }

    /** 补全不完整的JSON字符串 */
    private completeJson(partial: string): string {
        if (!partial.trim()) return '{}';

        const stack: ('{' | '[')[] = [];
        let inString = false;
        let escapeNext = false;

        for (const char of partial) {
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            if (char === '"') inString = !inString;
            else if (char === '\\') escapeNext = true;
            else if (!inString) {
                if (char === '{' || char === '[') stack.push(char);
                else if (char === '}' && stack.length > 0 && stack[stack.length - 1] === '{') stack.pop();
                else if (char === ']' && stack.length > 0 && stack[stack.length - 1] === '[') stack.pop();
            }
        }

        let completed = partial;
        if (inString) completed += '"';
        // 修正笔误：将completedmpleted改为completed
        for (let i = stack.length - 1; i >= 0; i--) {
            completed += stack[i] === '{' ? '}' : ']';
        }

        // 确保字符串以 { 开头，但避免重复添加
        if (!completed.startsWith('{') && !completed.startsWith('"')) completed = '{' + completed;
        if (!completed.endsWith('}') && !completed.endsWith('"')) completed += '}';

        return completed;
    }

    /** 提取工具名和方法名 */
    private extractTool(completedJson: string): {
        toolName: string | null;
        methodName: string | null;
    } {
        try {
            const parsed = JSON.parse(completedJson);
            const key = Object.keys(parsed)[0];
            if (!key) return { toolName: null, methodName: null };

            const [toolName, methodName] = key.split('.', 2);
            return { toolName, methodName: methodName || null };
        } catch {
            // 匹配 "key" 或 "key": value 格式，支持各种值类型
            const match = completedJson.match(/"([^"]+)"\s*(:\s*(\{|\[|".*?"|[^,}\]]*))?/);
            if (!match?.[1]) return { toolName: null, methodName: null };

            const [toolName, methodName] = match[1].split('.', 2);
            return { toolName, methodName: methodName || null };
        }
    }

    /** 提取参数列表 */
    private extractParams(completedJson: string, toolName: string | null, methodName: string | null): any[] {
        if (!toolName) return [];

        try {
            const parsed = JSON.parse(completedJson);
            const key = methodName ? `${toolName}.${methodName}` : toolName;
            const value = parsed[key];

            return Array.isArray(value) ? value : (value !== undefined ? [value] : []);
        } catch {
            return [];
        }
    }
}

export const toolService = new ToolService();
