<template>
    <v-app>
        <!-- 导航抽屉 -->
        <v-navigation-drawer v-model="drawer" :permanent="$vuetify.display.mdAndUp" :temporary="$vuetify.display.smAndDown">
            <template v-slot:prepend>
                <div class="pa-4">
                    <div class="d-flex align-center ga-3">
                        <v-avatar size="48" rounded="lg">
                            <v-img src="/logo.svg" />
                        </v-avatar>
                        <div>
                            <div class="font-weight-bold">多为智心</div>
                            <div class="text-caption text-medium-emphasis">心理健康助手</div>
                        </div>
                    </div>
                </div>
            </template>

            <v-divider />

            <v-list nav class="pa-2">
                <v-list-item prepend-icon="mdi-message-text-outline" title="咨询室" value="chat" rounded="lg"
                    color="primary" active />
                <v-list-item prepend-icon="mdi-history" title="历史记录" value="history" rounded="lg" disabled />
            </v-list>

            <template v-slot:append>
                <div class="pa-2">
                    <v-btn block variant="tonal" color="primary" prepend-icon="mdi-cog" class="rounded-lg"
                        @click="$router.push('/setting')">
                        设置
                    </v-btn>
                </div>
            </template>
        </v-navigation-drawer>

        <!-- 应用栏 -->
        <v-app-bar flat>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
            <v-app-bar-title class="font-weight-bold">咨询室</v-app-bar-title>
            <v-btn icon="mdi-cog" variant="text" class="d-md-none" @click="$router.push('/setting')" />
        </v-app-bar>

        <!-- 主内容区 -->
        <v-main>
            <v-container class="pa-4 pa-sm-6" style="max-width: 900px;">

                <!-- 空状态 -->
                <div v-if="visibleMessages.length === 0"
                    class="d-flex flex-column align-center justify-center text-center" style="min-height: 70vh;">
                    
                    <v-avatar size="100" color="primary" variant="tonal" class="mb-6">
                        <v-icon size="56">mdi-head-heart</v-icon>
                    </v-avatar>
                    
                    <h1 class="text-h5 font-weight-bold mb-2">欢迎来到多为心理咨询室</h1>

                    <v-card variant="flat" class="rounded-xl pa-4" style="max-width: 420px;">
                        <div class="text-caption text-medium-emphasis mb-3 d-flex align-center">
                            <v-icon size="16" start>mdi-lightbulb-outline</v-icon>
                            试试这些话题开始对话
                        </div>
                        <div class="d-flex flex-wrap ga-2">
                            <v-chip v-for="suggestion in suggestions" :key="suggestion" variant="tonal"
                                color="primary" size="small" class="rounded-lg" @click="setSuggestion(suggestion)">
                                {{ suggestion }}
                            </v-chip>
                        </div>
                    </v-card>
                </div>

                <!-- 消息列表 -->
                <div v-else class="d-flex flex-column ga-4">
                    <template v-for="(message, index) in visibleMessages" :key="index">
                        
                        <!-- 用户消息 -->
                        <div v-if="message.role === 'user'" class="d-flex justify-end ga-3">
                            <v-card variant="flat" color="primary" class="rounded-xl rounded-te-sm"
                                style="max-width: 75%;">
                                <v-card-text class="pa-3 text-body-2"
                                    style="overflow-wrap: break-word; word-break: break-word; white-space: pre-wrap;">
                                    {{ message.content }}
                                </v-card-text>
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
                                <!-- 思考过程（可折叠） -->
                                <v-card v-if="message.thinking" variant="tonal" color="grey"
                                    class="rounded-lg mb-2" density="compact">
                                    <v-card-text class="pa-0">
                                        <div class="d-flex align-center px-3 py-2 cursor-pointer"
                                            @click="toggleThinking(index)"
                                            style="user-select: none;">
                                            <v-icon size="16" class="mr-2" :class="{ 'thinking-icon': chatService.status.value === 'thinking' }">
                                                mdi-lightbulb-outline
                                            </v-icon>
                                            <span class="text-caption font-weight-medium">思考过程</span>
                                            <v-spacer />
                                            <v-icon size="16">
                                                {{ expandedThinking.has(index) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                                            </v-icon>
                                        </div>
                                        <v-expand-transition>
                                            <div v-show="expandedThinking.has(index)">
                                                <v-divider />
                                                <div class="pa-3 text-caption" 
                                                    style="overflow-wrap: break-word; word-break: break-word; white-space: pre-wrap; opacity: 0.85;">
                                                    {{ message.thinking }}
                                                </div>
                                            </div>
                                        </v-expand-transition>
                                    </v-card-text>
                                </v-card>
                                
                                <!-- 消息内容 -->
                                <v-card variant="flat" class="rounded-xl rounded-ts-sm">
                                    <v-card-text class="pa-3 text-body-2"
                                        style="overflow-wrap: break-word; word-break: break-word; white-space: pre-wrap;">
                                        {{ message.processedContent || message.content }}
                                    </v-card-text>
                                </v-card>
                            </div>
                        </div>

                    </template>
                </div>

            </v-container>
        </v-main>

        <!-- 底部输入区 -->
        <v-footer app color="transparent" class="pa-0">
            <v-container class="pa-3 pa-sm-4" style="max-width: 900px;">
                <v-card variant="flat" class="rounded-xl">
                    <v-textarea v-model="chatService.editorText.value" placeholder="想聊点什么..."
                        rows="1" max-rows="6" auto-grow hide-details variant="plain" class="px-4 pb-0"
                        @keydown="handleKeydown" />
                    <div class="d-flex align-center pa-2">
                        <!-- 模型选择 -->
                        <v-menu offset-y>
                            <template v-slot:activator="{ props }">
                                <v-chip v-bind="props" variant="tonal" size="small" class="rounded-lg" label>
                                    <v-icon start size="14">mdi-robot-outline</v-icon>
                                    {{ currentModelName }}
                                    <v-icon end size="14">mdi-chevron-down</v-icon>
                                </v-chip>
                            </template>
                            <v-card class="rounded-xl" min-width="220">
                                <v-list density="compact" class="pa-2">
                                    <template v-for="provider in providerOptions" :key="provider.value">
                                        <v-list-subheader class="text-caption font-weight-bold">
                                            {{ provider.text }}
                                        </v-list-subheader>
                                        <v-list-item v-for="model in optionsSetting.models[provider.value]"
                                            :key="model.value" :title="model.text" density="compact"
                                            :active="isModelSelected(provider.value, model.value)"
                                            @click="selectModel(provider.value, model.value)" rounded="lg"
                                            class="mb-1">
                                            <template v-slot:prepend>
                                                <v-icon size="18" :color="isModelSelected(provider.value, model.value) ? 'primary' : undefined">
                                                    {{ isModelSelected(provider.value, model.value) ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                                                </v-icon>
                                            </template>
                                        </v-list-item>
                                    </template>
                                </v-list>
                            </v-card>
                        </v-menu>
                        
                        <v-spacer />
                        
                        <!-- 发送按钮 -->
                        <v-btn @click="handleSend" :disabled="!chatService.editorText.value.trim()"
                            variant="flat" color="primary" icon="mdi-send" size="x-small" class="rounded-lg" />
                    </div>
                </v-card>
                <p class="text-center text-caption text-medium-emphasis mt-2">
                    内容由AI生成，仅供参考
                </p>
            </v-container>
        </v-footer>

        <!-- API密钥输入对话框 -->
        <v-dialog v-model="showApiKeyDialog" max-width="420" persistent>
            <v-card class="rounded-xl pa-4">
                <v-card-title class="text-h6 font-weight-bold pb-2 d-flex align-center">
                    <v-icon start color="warning">mdi-key-alert</v-icon>
                    请输入 API 密钥
                </v-card-title>
                <v-card-text class="pb-4">
                    <p class="text-body-2 text-medium-emphasis mb-4">
                        使用 {{ currentProviderName }} 需要配置 API 密钥才能进行对话。
                    </p>
                    <v-text-field v-model="tempApiKey" label="API 密钥" variant="outlined" density="comfortable"
                        type="password" placeholder="请输入您的 API 密钥" hide-details class="rounded-lg" />
                </v-card-text>
                <v-card-actions class="px-0 ga-2">
                    <v-btn variant="text" @click="showApiKeyDialog = false" class="rounded-pill">取消</v-btn>
                    <v-spacer />
                    <v-btn variant="tonal" @click="goToSettings" class="rounded-pill">
                        <v-icon start size="18">mdi-cog</v-icon>
                        前往设置
                    </v-btn>
                    <v-btn color="primary" variant="flat" @click="saveApiKeyAndSend" :disabled="!tempApiKey.trim()"
                        class="rounded-pill">
                        保存并发送
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>

<script setup lang="ts">
import { nextTick, watch, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { chatService } from '@/utils/chatService'
import { settingService, type ModelProvider, optionsSetting, providerOptions } from '@/utils/settingService'
import { useDisplay } from 'vuetify'

const router = useRouter()
const { mdAndUp } = useDisplay()
const drawer = ref(mdAndUp.value)

// 设置状态
const settings = ref(settingService.getAll())

// API密钥对话框
const showApiKeyDialog = ref(false)
const tempApiKey = ref('')

// 思考过程展开状态
const expandedThinking = ref(new Set<number>())

// 切换思考过程展开/折叠
function toggleThinking(index: number) {
    if (expandedThinking.value.has(index)) {
        expandedThinking.value.delete(index)
    } else {
        expandedThinking.value.add(index)
    }
    expandedThinking.value = new Set(expandedThinking.value)
}

// 常见开场白建议
const suggestions = ['最近感到压力很大', '睡眠质量不好', '工作焦虑', '人际关系困扰', '情绪低落', '家庭矛盾']

// 可见消息列表（过滤掉visible: false的消息）
const visibleMessages = computed(() => 
    chatService.messages.value.filter(m => m.visible !== false && m.role !== 'system')
)

// 当前供应商名称
const currentProviderName = computed(() => {
    const provider = providerOptions.find(p => p.value === settings.value.provider)
    return provider?.text || 'AI'
})

// 当前模型名称
const currentModelName = computed(() => {
    const provider = settings.value.provider
    const modelValue = settings.value.models[provider]
    const model = optionsSetting.models[provider]?.find(m => m.value === modelValue)
    return model?.text || modelValue
})

// 判断模型是否选中
function isModelSelected(provider: ModelProvider, model: string): boolean {
    return settings.value.provider === provider && settings.value.models[provider] === model
}

// 选择模型
function selectModel(provider: ModelProvider, model: string) {
    settingService.set('provider', provider)
    settingService.setModel(provider, model)
    settings.value = settingService.getAll()
}

// 检查API密钥并发送
function handleSend() {
    const provider = settings.value.provider
    const apiKey = settings.value.apiKeys[provider]
    
    if (!apiKey) {
        tempApiKey.value = ''
        showApiKeyDialog.value = true
        return
    }
    
    chatService.send()
}

// 保存API密钥并发送
function saveApiKeyAndSend() {
    const provider = settings.value.provider
    settingService.setApiKey(provider, tempApiKey.value)
    settings.value = settingService.getAll()
    showApiKeyDialog.value = false
    chatService.send()
}

// 前往设置页
function goToSettings() {
    showApiKeyDialog.value = false
    router.push('/setting')
}

// 处理键盘事件
function handleKeydown(event: KeyboardEvent) {
    // Shift + Enter 换行
    if (event.shiftKey && event.key === 'Enter') {
        return
    }

    // Enter 发送消息
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        handleSend()
    }
}

// 聚焦到输入框
function focusInput() {
    nextTick(() => {
        const textarea = document.querySelector('textarea')
        if (textarea) {
            textarea.focus()
        }
    })
}

// 设置建议内容
function setSuggestion(suggestion: string) {
    chatService.editorText.value = suggestion
    focusInput()
}

// 监听消息变化，自动滚动到底部
watch(
    () => chatService.messages.value,
    () => {
        nextTick(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            })
        })
    },
)
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
</style>