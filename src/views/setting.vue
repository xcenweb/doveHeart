<template>
    <v-app>
        <v-app-bar flat>
            <v-btn icon="mdi-arrow-left" @click="$router.back()" />
            <v-app-bar-title class="font-weight-bold">设置</v-app-bar-title>
        </v-app-bar>

        <v-main>
            <v-container class="mx-auto pa-4 pa-sm-8" style="max-width: 800px;">

                <div class="d-flex flex-column ga-6">
                    <section>
                        <h2 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center text-primary px-2">
                            <v-icon start size="20">mdi-palette-outline</v-icon>
                            外观
                        </h2>
                        <v-card variant="flat" class="rounded-xl overflow-hidden">
                            <v-list class="pa-0">
                                <v-list-item class="py-4 px-4 px-sm-6">
                                    <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between w-100 ga-4">
                                        <div class="d-flex align-center ga-4">
                                            <v-icon color="medium-emphasis">mdi-theme-light-dark</v-icon>
                                            <div>
                                                <div class="font-weight-bold">主题模式</div>
                                                <div class="text-caption text-medium-emphasis">选择应用的主题模式</div>
                                            </div>
                                        </div>
                                        <div class="w-100 w-sm-auto" style="min-width: 160px;">
                                            <v-select v-model="settings.theme" :items="optionsSetting.theme" item-title="text"
                                                item-value="value" density="compact" variant="solo-filled" hide-details flat
                                                @update:model-value="updateSetting('theme', $event || 'system')" />
                                        </div>
                                    </div>
                                </v-list-item>
                                <v-divider inset />
                                <v-list-item class="py-4 px-4 px-sm-6">
                                    <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between w-100 ga-4">
                                        <div class="d-flex align-center ga-4">
                                            <v-icon color="medium-emphasis">mdi-translate</v-icon>
                                            <div>
                                                <div class="font-weight-bold">界面语言</div>
                                                <div class="text-caption text-medium-emphasis">选择应用的显示语言</div>
                                            </div>
                                        </div>
                                        <div class="w-100 w-sm-auto" style="min-width: 160px;">
                                            <v-select v-model="settings.language" :items="optionsSetting.language"
                                                item-title="text" item-value="value" density="compact" variant="solo-filled"
                                                hide-details flat
                                                @update:model-value="updateSetting('language', $event)" />
                                        </div>
                                    </div>
                                </v-list-item>
                            </v-list>
                        </v-card>
                    </section>

                    <section>
                        <h2 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center text-primary px-2">
                            <v-icon start size="20">mdi-robot-outline</v-icon>
                            模型
                        </h2>
                        <v-card variant="flat" class="rounded-xl overflow-hidden">
                            <v-list class="pa-0">
                                <v-list-item class="py-4 px-4 px-sm-6">
                                    <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between w-100 ga-4">
                                        <div class="d-flex align-center ga-4">
                                            <v-icon color="medium-emphasis">mdi-cloud-outline</v-icon>
                                            <div>
                                                <div class="font-weight-bold">AI 供应商</div>
                                                <div class="text-caption text-medium-emphasis">选择 AI 服务提供商</div>
                                            </div>
                                        </div>
                                        <div class="w-100 w-sm-auto" style="min-width: 200px;">
                                            <v-select v-model="settings.provider" :items="Object.entries(optionsSetting.providers).map(([key, provider]) => ({ text: provider.name, value: key }))"
                                                item-title="text" item-value="value" density="compact" variant="solo-filled"
                                                hide-details flat @update:model-value="updateProvider" />
                                        </div>
                                    </div>
                                </v-list-item>
                                <v-divider inset />
                                <v-list-item class="py-4 px-4 px-sm-6">
                                    <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between w-100 ga-4">
                                        <div class="d-flex align-center ga-4">
                                            <v-icon color="medium-emphasis">mdi-brain</v-icon>
                                            <div>
                                                <div class="font-weight-bold">选择模型</div>
                                                <div class="text-caption text-medium-emphasis">选择 {{ currentProviderName }} 的模型版本</div>
                                            </div>
                                        </div>
                                        <div class="w-100 w-sm-auto" style="min-width: 200px;">
                                            <v-select v-model="currentModel" :items="currentModelOptions"
                                                item-title="text" item-value="value" density="compact" variant="solo-filled"
                                                hide-details flat />
                                        </div>
                                    </div>
                                </v-list-item>
                                <v-divider inset />
                                <v-list-item class="py-4 px-4 px-sm-6">
                                    <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between w-100 ga-4">
                                        <div class="d-flex align-center ga-4">
                                            <v-icon color="medium-emphasis">mdi-key-variant</v-icon>
                                            <div>
                                                <div class="font-weight-bold">API 密钥</div>
                                                <div class="text-caption text-medium-emphasis">{{ currentProviderName }} 的认证密钥</div>
                                            </div>
                                        </div>
                                        <div class="w-100 w-sm-auto" style="min-width: 200px;">
                                            <v-text-field v-model="currentApiKey" density="compact" variant="solo-filled"
                                                hide-details flat type="password" placeholder="输入密钥" />
                                        </div>
                                    </div>
                                </v-list-item>
                            </v-list>
                        </v-card>
                    </section>

                    <section>
                        <h2 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center text-primary px-2">
                            <v-icon start size="20">mdi-cached</v-icon>
                            更新
                        </h2>
                        <v-card variant="flat" class="rounded-xl overflow-hidden">
                            <v-list class="pa-0">
                                <v-list-item class="py-4 px-4 px-sm-6">
                                    <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between w-100 ga-4">
                                        <div class="d-flex align-center ga-4">
                                            <v-icon color="medium-emphasis">mdi-update</v-icon>
                                            <div>
                                                <div class="font-weight-bold">自动检查更新</div>
                                                <div class="text-caption text-medium-emphasis">应用启动时自动获取最新版本</div>
                                            </div>
                                        </div>
                                        <div class="d-flex justify-end">
                                            <v-switch v-model="settings.autoCheckUpdate" color="primary" hide-details inset
                                                @update:model-value="updateSetting('autoCheckUpdate', $event || false)" />
                                        </div>
                                    </div>
                                </v-list-item>
                                <v-divider inset />
                                <v-list-item class="py-4 px-4 px-sm-6">
                                    <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between w-100 ga-4">
                                        <div class="d-flex align-center ga-4">
                                            <v-icon color="medium-emphasis">mdi-source-branch</v-icon>
                                            <div>
                                                <div class="font-weight-bold">更新通道</div>
                                                <div class="text-caption text-medium-emphasis">正式版更稳定，测试版功能更多</div>
                                            </div>
                                        </div>
                                        <div class="w-100 w-sm-auto" style="min-width: 160px;">
                                            <v-select v-model="settings.updateChannel" :items="optionsSetting.updateChannel"
                                                item-title="text" item-value="value" density="compact" variant="solo-filled"
                                                hide-details flat
                                                @update:model-value="updateSetting('updateChannel', $event)" />
                                        </div>
                                    </div>
                                </v-list-item>
                            </v-list>
                        </v-card>
                    </section>

                    <!-- 操作区域 -->
                    <div class="mt-4 px-2">
                        <v-btn block color="error" variant="tonal" prepend-icon="mdi-refresh"
                            class="rounded-pill font-weight-bold" height="48" @click="confirmReset">
                            恢复默认设置
                        </v-btn>
                    </div>
                </div>
            </v-container>
        </v-main>

        <!-- 确认重置对话框 -->
        <v-dialog v-model="showResetDialog" max-width="400">
            <v-card class="rounded-xl pa-4">
                <v-card-title class="text-h6 font-weight-bold pb-2">确认重置？</v-card-title>
                <v-card-text class="text-medium-emphasis pb-6">
                    此操作将清除您所有的个性化配置并恢复为系统默认状态。此操作不可撤销。
                </v-card-text>
                <v-card-actions class="px-0 ga-2">
                    <v-spacer />
                    <v-btn variant="text" @click="showResetDialog = false" class="px-6 rounded-pill">取消</v-btn>
                    <v-btn color="error" variant="flat" @click="resetSettings" class="px-6 rounded-pill">
                        确认重置
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { settingService, type AppSettings, optionsSetting } from '@/utils/settingService'
import { useSnackbar } from '@/components/global/snackbarService'

// 设置项
const settings = ref<AppSettings>(settingService.getAll())

// 初始化主题监听
onMounted(() => {
    settingService.initThemeWatcher()
})

// 重置确认对话框状态
const showResetDialog = ref(false)

// 当前供应商名称
const currentProviderName = computed(() => {
    const provider = optionsSetting.providers[settings.value.provider]
    return provider?.name || 'AI'
})

// 当前供应商的API密钥
const currentApiKey = computed({
    get: () => settings.value.apiKeys?.[settings.value.provider] || '',
    set: (value: string) => {
        if (!settings.value.apiKeys) {
            settings.value.apiKeys = { chatglm: '' }
        }
        settings.value.apiKeys[settings.value.provider] = value
        settingService.set('apiKeys', settings.value.apiKeys)
        settings.value = settingService.getAll()
        useSnackbar().info('设置已保存')
    }
})

// 当前供应商的模型
const currentModel = computed({
    get: () => settings.value.models?.[settings.value.provider] || '',
    set: (value: string) => {
        if (!settings.value.models) {
            settings.value.models = { chatglm: 'glm-4-flash' }
        }
        settings.value.models[settings.value.provider] = value
        settingService.set('models', settings.value.models)
        settings.value = settingService.getAll()
        useSnackbar().info('设置已保存')
    }
})

// 当前供应商的可选模型列表
const currentModelOptions = computed(() => {
    return optionsSetting.providers[settings.value.provider]?.models || []
})

// 更新供应商
const updateProvider = (value: string) => {
    settingService.set('provider', value)
    settings.value = settingService.getAll()
    useSnackbar().info('设置已保存')
}

// 更新设置项
const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    settingService.set(key, value)
    settings.value = settingService.getAll()
    if (key === 'theme') {
        settingService.applyTheme()
    }
    useSnackbar().info('设置已保存')
}

// 显示重置确认对话框
const confirmReset = () => {
    showResetDialog.value = true
}

// 恢复默认设置
const resetSettings = () => {
    settingService.reset()
    settings.value = settingService.getAll()
    settingService.applyTheme()
    showResetDialog.value = false
    useSnackbar().info('已恢复默认设置')
}
</script>
