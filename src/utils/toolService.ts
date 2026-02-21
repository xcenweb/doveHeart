/** 导入工具名称类型 */
export type ToolNames =
    | 'think'
    | 'memory'
    | 'select'
    | 'text'
    | 'web_search'

/** 调用工具定义 */
export interface ToolCall {
    /** 名称 */
    tool: ToolNames
}

/** 工具返回定义 */
export interface ToolReturn {
    /** 是否成功 */
    success: boolean
    /** 返回内容 */
    return: string | boolean
}


export class ToolService {

    constructor() {}

    /**
     * 解析json获取工具名字及参数
     */
    async parse(json: string) {
        try {
            console.log(json)
        } catch (e) {
            return null
        }
    }

    /**
     * 调用工具
     */
    async call() {
        return ''
    }
}
