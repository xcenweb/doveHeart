<template>
    <v-app>
        <v-app-bar>
            <v-btn icon="mdi-arrow-left" @click="$router.back()" />
            <v-app-bar-title>设置</v-app-bar-title>
        </v-app-bar>

        <v-main>
            <v-container>

                <!-- 应用信息卡片 -->
                <v-card class="mb-4">
                    <div class="d-flex flex-column flex-md-row">
                        <v-avatar class="ma-4 mx-auto mx-md-4" size="80">
                            <v-img src="/logo.svg"></v-img>
                        </v-avatar>
                        <div class="d-flex flex-column justify-center pa-4 flex-grow-1">
                            <v-card-title class="d-flex align-center justify-center justify-md-start pa-0">
                                <span class="text-h6">多维之心</span>
                                <v-chip color="primary" size="small" class="ml-3">
                                    v{{ appVersion || 'null' }}
                                </v-chip>
                            </v-card-title>
                            <v-card-text class="pa-0 pt-2 text-center text-md-left">
                                <div class="text-subtitle-1 text-medium-emphasis">您的心理健康伙伴</div>
                            </v-card-text>
                            <v-card-actions class="pa-0 pt-4 justify-center justify-md-start">
                                <v-btn prepend-icon="mdi-github" variant="outlined" @click="openGitHub">
                                    查看 GitHub
                                </v-btn>
                            </v-card-actions>
                        </div>
                    </div>
                </v-card>

                <!-- 外观设置卡片 -->
                <v-card class="mb-4">
                    <v-card-title class="text-subtitle-1 font-weight-bold">外观</v-card-title>
                    <v-divider></v-divider>
                    <v-list lines="two" class="py-0">
                        <v-list-item>
                            <template v-slot:title>
                                <div class="d-flex align-center">
                                    <v-icon start>mdi-theme-light-dark</v-icon>
                                    <span>主题</span>
                                </div>
                            </template>
                            <template v-slot:subtitle>
                                <div class="text-caption">选择应用的主题模式</div>
                            </template>
                            <template v-slot:append>
                                <v-select v-model="settings.theme" :items="optionsSetting.theme" item-title="text"
                                    item-value="value" density="compact" variant="outlined" hide-details
                                    style="width: 150px;"
                                    @update:model-value="updateSetting('theme', $event === null ? 'system' : $event)"
                                    transition="fade-transition" />
                            </template>
                        </v-list-item>
                        <v-list-item>
                            <template v-slot:title>
                                <div class="d-flex align-center">
                                    <v-icon start>mdi-translate</v-icon>
                                    <span>界面语言</span>
                                </div>
                            </template>
                            <template v-slot:subtitle>
                                <div class="text-caption">选择应用的显示语言</div>
                            </template>
                            <template v-slot:append>
                                <v-select v-model="settings.language" :items="optionsSetting.language" item-title="text"
                                    item-value="value" density="compact" variant="outlined" hide-details
                                    style="width: 150px;" @update:model-value="updateSetting('language', $event)"
                                    transition="fade-transition" />
                            </template>
                        </v-list-item>
                    </v-list>
                </v-card>

                <!-- AI模型设置卡片 -->
                <v-card class="mb-4">
                    <v-card-title class="text-subtitle-1 font-weight-bold">AI模型</v-card-title>
                    <v-divider></v-divider>
                    <v-list lines="two" class="py-0">
                        <v-list-item>
                            <template v-slot:title>
                                <div class="d-flex align-center">
                                    <v-icon start>mdi-key</v-icon>
                                    <span>API密钥</span>
                                </div>
                            </template>
                            <template v-slot:subtitle>
                                <div class="text-caption">用于访问AI服务的认证密钥</div>
                            </template>
                            <template v-slot:append>
                                <v-text-field v-model="settings.apiKey" density="compact" variant="outlined"
                                    hide-details style="width: 200px;" type="password" placeholder="请输入API密钥"
                                    @update:model-value="updateSetting('apiKey', $event)"
                                    transition="fade-transition" />
                            </template>
                        </v-list-item>
                        <v-list-item>
                            <template v-slot:title>
                                <div class="d-flex align-center">
                                    <v-icon start>mdi-brain</v-icon>
                                    <span>模型选择</span>
                                </div>
                            </template>
                            <template v-slot:subtitle>
                                <div class="text-caption">选择要使用的AI模型</div>
                            </template>
                            <template v-slot:append>
                                <v-select v-model="settings.model" :items="optionsSetting.models.chatglm"
                                    item-title="text" item-value="value" density="compact" variant="outlined"
                                    hide-details style="width: 200px;"
                                    @update:model-value="updateSetting('model', $event)" transition="fade-transition" />
                            </template>
                        </v-list-item>
                    </v-list>
                </v-card>

                <!-- 更新设置卡片 -->
                <v-card class="mb-4">
                    <v-card-title class="text-subtitle-1 font-weight-bold">更新</v-card-title>
                    <v-divider></v-divider>
                    <v-list lines="two" class="py-0">
                        <v-list-item>
                            <template v-slot:title>
                                <div class="d-flex align-center">
                                    <v-icon start>mdi-update</v-icon>
                                    <span>自动检查更新</span>
                                </div>
                            </template>
                            <template v-slot:subtitle>
                                <div class="text-caption">是否自动检查应用更新</div>
                            </template>
                            <template v-slot:append>
                                <v-switch v-model="settings.autoCheckUpdate" hide-details color="primary"
                                    @update:model-value="updateSetting('autoCheckUpdate', $event === null ? false : $event)"
                                    transition="fade-transition" />
                            </template>
                        </v-list-item>
                        <v-list-item>
                            <template v-slot:title>
                                <div class="d-flex align-center">
                                    <v-icon start>mdi-source-branch</v-icon>
                                    <span>更新通道</span>
                                </div>
                            </template>
                            <template v-slot:subtitle>
                                <div class="text-caption">选择更新版本的类型</div>
                            </template>
                            <template v-slot:append>
                                <v-select v-model="settings.updateChannel" :items="optionsSetting.updateChannel"
                                    item-title="text" item-value="value" density="compact" variant="outlined"
                                    hide-details style="width: 150px;"
                                    @update:model-value="updateSetting('updateChannel', $event)"
                                    transition="fade-transition" />
                            </template>
                        </v-list-item>
                    </v-list>
                </v-card>

                <!-- 操作按钮 -->
                <v-card>
                    <v-card-text class="pa-3">
                        <v-btn prepend-icon="mdi-refresh" block color="error" variant="outlined" @click="confirmReset"
                            transition="scale-transition">
                            恢复默认设置
                        </v-btn>
                    </v-card-text>
                </v-card>
            </v-container>
        </v-main>
    </v-app>

    <!-- 确认重置对话框 -->
    <v-dialog v-model="showResetDialog" max-width="500" transition="dialog-bottom-transition">
        <v-card>
            <v-card-title class="text-subtitle-1 font-weight-bold">确认重置</v-card-title>
            <v-card-text>确定要将所有设置恢复为默认值吗？</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="showResetDialog = false">取消</v-btn>
                <v-btn color="primary" @click="resetSettings">确定</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getVersion } from '@tauri-apps/api/app'
import { settingService, type AppSettings, optionsSetting } from '@/utils/settingService'
import { useSnackbar } from '@/components/global/snackbarService'
import { openUrl } from '@tauri-apps/plugin-opener'

// 应用版本
const appVersion = ref('')

// 设置项
const settings = ref<AppSettings>(settingService.getAll())

// 重置确认对话框状态
const showResetDialog = ref(false)

// 打开GitHub链接
const openGitHub = () => {
    openUrl('https://github.com/')
}

// 更新设置项
const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    settingService.set(key, value)
    settings.value = settingService.getAll()
    useSnackbar().info('设置已更新')
}

// 显示重置确认对话框
const confirmReset = () => {
    showResetDialog.value = true
}

// 恢复默认设置
const resetSettings = () => {
    settingService.reset()
    settings.value = settingService.getAll()
    showResetDialog.value = false
    useSnackbar().info('已恢复默认设置')
}

// 页面加载时获取数据
onMounted(async () => {
    appVersion.value = await getVersion()
})
</script>