<template>
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
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { chatService } from '@/utils/chatService'
import { settingService, type ModelProvider, optionsSetting, providerOptions } from '@/utils/settingService'

const router = useRouter()

const settings = ref(settingService.getAll())
const showApiKeyDialog = ref(false)
const tempApiKey = ref('')

const currentProviderName = computed(() => {
    const provider = providerOptions.find(p => p.value === settings.value.provider)
    return provider?.text || 'AI'
})

const currentModelName = computed(() => {
    const provider = settings.value.provider
    const modelValue = settings.value.models[provider]
    const model = optionsSetting.models[provider]?.find(m => m.value === modelValue)
    return model?.text || modelValue
})

function isModelSelected(provider: ModelProvider, model: string): boolean {
    return settings.value.provider === provider && settings.value.models[provider] === model
}

function selectModel(provider: ModelProvider, model: string) {
    settingService.set('provider', provider)
    settingService.setModel(provider, model)
    settings.value = settingService.getAll()
}

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

function saveApiKeyAndSend() {
    const provider = settings.value.provider
    settingService.setApiKey(provider, tempApiKey.value)
    settings.value = settingService.getAll()
    showApiKeyDialog.value = false
    chatService.send()
}

function goToSettings() {
    showApiKeyDialog.value = false
    router.push('/setting')
}

function handleKeydown(event: KeyboardEvent) {
    if (event.shiftKey && event.key === 'Enter') return
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        handleSend()
    }
}

/** 聚焦输入框 */
function focusInput() {
    nextTick(() => {
        const textarea = document.querySelector('textarea')
        if (textarea) textarea.focus()
    })
}

defineExpose({ focusInput })
</script>
