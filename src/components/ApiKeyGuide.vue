<template>
    <v-dialog v-model="dialog" max-width="500" persistent>
        <v-card class="rounded-xl">
            <v-card-title class="d-flex align-center ga-2 pa-5 pb-2">
                <v-avatar size="36" color="primary" variant="tonal">
                    <v-icon size="20">mdi-key-variant</v-icon>
                </v-avatar>
                <span class="text-h6 font-weight-bold">配置 API 密钥</span>
            </v-card-title>

            <v-card-text class="pa-0">
                <v-stepper alt-labels v-model="step" :items="['提供商', '获取密钥', '保存']" next-text="下一步" prev-text="上一步">

                    <!-- 第一步：选择模型提供商 -->
                    <template v-slot:item.1>
                        <div class="pa-5">
                            <div class="text-body-2 mb-4 text-medium-emphasis">
                                需配置 API 密钥才能开始使用
                            </div>

                            <v-radio-group v-model="selectedProvider" hide-details class="mb-2">
                                <v-radio v-for="(provider, key) in providers" :key="key" :value="key" color="primary"
                                    class="mb-1">
                                    <template v-slot:label>
                                        <div class="d-flex align-center ga-2">
                                            <span class="text-body-1">{{ provider.name }}</span>
                                            <v-chip v-if="key === 'chatglm'" size="x-small" color="success"
                                                variant="tonal">
                                                推荐
                                            </v-chip>
                                        </div>
                                    </template>
                                </v-radio>
                            </v-radio-group>
                        </div>
                    </template>

                    <!-- 第二步：跳转获取密钥 -->
                    <template v-slot:item.2>
                        <div class="pa-5">
                            <v-btn color="primary" variant="flat" block @click="openApiKeyPage">
                                <v-icon start size="20">mdi-open-in-new</v-icon>
                                前往 {{ currentProviderName }} 获取密钥
                            </v-btn>
                        </div>
                    </template>

                    <!-- 第三步：粘贴并确认 -->
                    <template v-slot:item.3>
                        <div class="pa-5">
                                <v-text-field v-model="apiKey" placeholder="xxxxxxxxxxxxxxxxxxxxxxxx" hide-details
                                    type="password" @paste="handlePaste" label="API 密钥" class="mb-4">
                                </v-text-field>
                            <v-btn color="primary" variant="flat" block :loading="saving" @click="saveApiKey">
                                保存
                            </v-btn>
                        </div>
                    </template>
                </v-stepper>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { settingService, optionsSetting } from '@/utils/settingService'
import { useSnackbar } from './global/snackbarService'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; 'complete': [] }>()

const dialog = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

// 状态和计算属性
const step = ref(1)
const selectedProvider = ref('chatglm')
const apiKey = ref('')
const saving = ref(false)
const clipboardDetected = ref(false)
const providers = computed(() => optionsSetting.providers)
const currentProviderName = computed(() => providers.value[selectedProvider.value]?.name || '')

// 重置状态
watch(dialog, (newVal) => {
    if (newVal) {
        step.value = 1
        selectedProvider.value = settingService.get('provider') || 'chatglm'
        apiKey.value = ''
        saving.value = false
        clipboardDetected.value = false
    }
})

// 打开 API 密钥页面并跳转到下一步
const openApiKeyPage = () => {
    const urls: Record<string, string> = {
        chatglm: 'https://open.bigmodel.cn/usercenter/apikeys',
        openai: 'https://platform.openai.com/api-keys'
    }
    const url = urls[selectedProvider.value]
    if (url) {
        window.open(url, '_blank')
        step.value = 3 // 直接跳转到粘贴确认步骤
    }
}

// 剪贴板操作
const handleClipboard = (text: string) => {
    if (text) {
        // 清理非ASCII字符，只保留标准的API密钥字符
        const cleanText = text.trim().replace(/[^\x00-\x7F]/g, '')
        apiKey.value = cleanText
        clipboardDetected.value = true
        useSnackbar().success('已粘贴密钥')
    } else {
        useSnackbar().warning('剪贴板为空')
    }
}

const handlePaste = (event: ClipboardEvent) => {
    const text = event.clipboardData?.getData('text') || ''
    handleClipboard(text)
}

// 保存 API 密钥
const saveApiKey = async () => {
    if (!apiKey.value.trim()) {
        useSnackbar().error('请输入 API 密钥')
        return
    }

    saving.value = true
    try {
        // 批量保存配置
        const updates = {
            provider: selectedProvider.value,
            apiKeys: { ...settingService.get('apiKeys'), [selectedProvider.value]: apiKey.value.trim() },
            models: { ...settingService.get('models'), [selectedProvider.value]: providers.value[selectedProvider.value].defaultModel }
        }

        Object.entries(updates).forEach(([key, value]) =>
            settingService.set(key as any, value)
        )

        useSnackbar().success('配置成功！')
        dialog.value = false
        emit('complete')
    } catch {
        useSnackbar().error('保存失败，请重试')
    } finally {
        saving.value = false
    }
}
</script>