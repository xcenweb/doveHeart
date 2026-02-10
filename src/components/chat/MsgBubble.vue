<template>
    <!-- 用户消息 -->
    <div v-if="message.role === 'user'" class="d-flex justify-end ga-3">
        <v-card variant="flat" color="primary" class="rounded-xl rounded-te-sm message-card" style="max-width: 75%;">
            <v-card-text class="pa-3 text-body-2"
                style="overflow-wrap: break-word; word-break: break-word; white-space: pre-wrap;">
                {{ message.content }}
            </v-card-text>
            <v-menu location="bottom end">
                <template v-slot:activator="{ props: menuProps }">
                    <v-btn
                        v-bind="menuProps"
                        icon="mdi-dots-vertical"
                        variant="text"
                        size="x-small"
                        class="message-menu-btn"
                    />
                </template>
                <v-list density="compact">
                    <v-list-item @click="showJsonDialog = true" prepend-icon="mdi-code-json">
                        <v-list-item-title>查看 JSON</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-card>
        <v-avatar size="36" color="primary" variant="tonal" class="flex-shrink-0">
            <v-icon size="20">mdi-account</v-icon>
        </v-avatar>
    </div>

    <!-- 助手消息 -->
    <div v-else-if="message.role === 'assistant'" class="d-flex justify-start ga-3">
        <v-avatar size="36" color="secondary" variant="tonal" class="flex-shrink-0">
            <v-icon size="20">mdi-head-heart</v-icon>
        </v-avatar>
        <div style="max-width: 75%;">
            <!-- 思考过程 -->
            <v-card v-if="message.toolCalls?.length" variant="tonal" color="grey"
                class="rounded-lg mb-2" density="compact">
                <v-card-text class="pa-0">
                    <div class="d-flex align-center px-3 py-2 cursor-pointer"
                        @click="expanded = !expanded"
                        style="user-select: none;">
                        <v-icon size="16" class="mr-2" :class="{ 'thinking-icon': isThinking }">
                            mdi-lightbulb-outline
                        </v-icon>
                        <span class="text-caption font-weight-medium">思考过程</span>
                        <v-spacer />
                        <v-icon size="16">
                            {{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                        </v-icon>
                    </div>
                    <v-expand-transition>
                        <div v-show="expanded">
                            <v-divider />
                            <div class="pa-3">
                                <v-timeline side="end" density="compact" line-inset="8" truncate-line="both">
                                    <v-timeline-item
                                        v-for="(tool, toolIndex) in message.toolCalls"
                                        :key="toolIndex"
                                        :dot-color="tool.name === 'send' ? 'success' : 'primary'"
                                        size="x-small"
                                    >
                                        <div class="text-caption">
                                            <span class="font-weight-bold">{{ tool.method ? `${tool.name}.${tool.method}` : tool.name }}</span>
                                            
                                            <!-- think工具特殊显示 -->
                                            <template v-if="tool.name === 'think'">
                                                <div class="mt-1 text-medium-emphasis" style="opacity: 0.9; white-space: pre-wrap;">
                                                    {{ tool.result }}
                                                </div>
                                            </template>
                                            
                                            <!-- 其他工具显示参数和结果 -->
                                            <template v-else>
                                                <span class="text-medium-emphasis ml-1" style="opacity: 0.75;">
                                                    ({{ tool.params.length ? tool.params.map(p => typeof p === 'string' ? `"${p}"` : JSON.stringify(p)).join(', ') : '无参数' }})
                                                </span>
                                                <div v-if="tool.result !== undefined" class="text-medium-emphasis" style="opacity: 0.75;">
                                                    → {{ JSON.stringify(tool.result) }}
                                                </div>
                                            </template>
                                        </div>
                                    </v-timeline-item>
                                </v-timeline>
                            </div>
                        </div>
                    </v-expand-transition>
                </v-card-text>
            </v-card>
            
            <!-- 消息内容 -->
            <v-card variant="flat" class="rounded-xl rounded-ts-sm message-card">
                <!-- 加载状态 -->
                <div v-if="isThinking && !displayContent" class="pa-3 d-flex align-center">
                    <v-progress-circular
                        indeterminate
                        size="20"
                        width="2"
                        color="primary"
                        class="mr-3"
                    ></v-progress-circular>
                    <span class="text-body-2 text-medium-emphasis">正在思考中...</span>
                </div>
                
                <!-- 消息文本内容 -->
                <v-card-text v-else-if="displayContent" class="pa-3 text-body-2"
                    style="overflow-wrap: break-word; word-break: break-word; white-space: pre-wrap;"
                >{{ displayContent }}</v-card-text>

                <!-- 选择选项 -->
                <template v-if="message.selectOptions">
                    <v-list density="compact" class="pa-1 rounded-xl"
                        :disabled="message.selectOptions.answered || isThinking">
                        <v-list-item
                            v-for="option in message.selectOptions.options"
                            :key="option"
                            :active="isOptionSelected(option)"
                            color="primary"
                            rounded="lg"
                            class="mb-1"
                            @click="handleOptionClick(option)"
                        >
                            <template v-slot:prepend>
                                <v-icon size="20">
                                    {{ getOptionIcon(option) }}
                                </v-icon>
                            </template>
                            <v-list-item-title class="text-body-2">{{ option }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                    <div v-if="message.selectOptions.mode === 'multi' && !message.selectOptions.answered && pendingSelections.size > 0"
                        class="px-3 pb-3">
                        <v-btn block variant="flat" color="primary" size="small" class="rounded-lg"
                            :disabled="isThinking"
                            @click="confirmMultiSelect">
                            确认选择 ({{ pendingSelections.size }})
                        </v-btn>
                    </div>
                </template>

                <!-- 消息菜单 -->
                <v-menu location="bottom end">
                    <template v-slot:activator="{ props: menuProps }">
                        <v-btn
                            v-bind="menuProps"
                            icon="mdi-dots-vertical"
                            variant="text"
                            size="x-small"
                            class="message-menu-btn"
                        />
                    </template>
                    <v-list density="compact">
                        <v-list-item @click="showJsonDialog = true" prepend-icon="mdi-code-json">
                            <v-list-item-title>查看 JSON</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-card>
        </div>
    </div>

    <!-- JSON 查看对话框 -->
    <v-dialog v-model="showJsonDialog" max-width="800">
        <v-card>
            <v-card-title class="d-flex align-center pa-4">
                <v-icon class="mr-2">mdi-code-json</v-icon>
                消息 JSON
                <v-spacer />
                <v-btn icon="mdi-close" variant="text" size="small" @click="showJsonDialog = false" />
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
                <pre class="json-content">{{ formattedJson }}</pre>
            </v-card-text>
            <v-divider />
            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn variant="text" @click="showJsonDialog = false">关闭</v-btn>
                <v-btn variant="tonal" color="primary" prepend-icon="mdi-content-copy" @click="copyJson">
                    复制
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { chatService, type Message } from '@/utils/chatService'
import snackbarService from '@/components/global/snackbarService'

const props = defineProps<{
    message: Message
    isThinking: boolean
}>()

const displayContent = computed(() => {
    if (props.message.processedContent) {
        return props.message.processedContent
    }
    return props.message.content || ''
})

const expanded = ref(false)
const pendingSelections = ref(new Set<string>())
const showJsonDialog = ref(false)

const formattedJson = computed(() => {
    return JSON.stringify(props.message, null, 2)
})

function copyJson() {
    navigator.clipboard.writeText(formattedJson.value)
    snackbarService.success('已复制到剪贴板')
    showJsonDialog.value = false
}

function isOptionSelected(option: string): boolean {
    if (props.message.selectOptions?.answered) {
        return props.message.selectOptions.selected?.includes(option) ?? false
    }
    return pendingSelections.value.has(option)
}

function getOptionIcon(option: string): string {
    const isMulti = props.message.selectOptions?.mode === 'multi'
    const selected = isOptionSelected(option)
    if (isMulti) return selected ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'
    return selected ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'
}

function handleOptionClick(option: string) {
    if (!props.message.selectOptions || props.message.selectOptions.answered) return

    if (props.message.selectOptions.mode === 'single') {
        chatService.selectOption([option])
    } else {
        if (pendingSelections.value.has(option)) {
            pendingSelections.value.delete(option)
        } else {
            pendingSelections.value.add(option)
        }
        pendingSelections.value = new Set(pendingSelections.value)
    }
}

function confirmMultiSelect() {
    const selected = Array.from(pendingSelections.value)
    if (selected.length === 0) return
    pendingSelections.value = new Set()
    chatService.selectOption(selected)
}
</script>

<style scoped>
.thinking-icon {
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
}

.cursor-pointer {
    cursor: pointer;
}

.message-card {
    position: relative;
}

.message-menu-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    opacity: 0;
    transition: opacity 0.2s;
}

.message-card:hover .message-menu-btn {
    opacity: 1;
}

.json-content {
    background: rgba(0, 0, 0, 0.05);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
    max-height: 60vh;
}
</style>
