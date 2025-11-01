<template>
    <v-app>
        <v-navigation-drawer :mobile-breakpoint="750" width="300">
            <template v-slot:prepend>
                <v-list-item lines="two" prepend-avatar="/logo.svg" rounded="lg" subtitle="心理健康助手"
                    title="多为智心"></v-list-item>
                <v-divider></v-divider>
            </template>
        </v-navigation-drawer>

        <v-app-bar class="px-2" flat>
            <template v-slot:prepend>
                <v-app-bar-nav-icon></v-app-bar-nav-icon>
            </template>
            <v-app-bar-title>咨询室</v-app-bar-title>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-cog" @click="$router.push('/setting')" />
        </v-app-bar>

        <v-main>
            <v-container>

                <v-row no-gutters class="pt-4">
                    <v-col cols="12" class="d-flex flex-column">

                        <!-- 空状态 -->
                        <div v-if="chatService.local_messages.value.length === 0"
                            class="d-flex flex-column align-center justify-center" style="height: 70vh;">
                            <v-icon size="128" color="primary">mdi-head-heart</v-icon>
                            <h2 class="text-h5 mt-4 mb-2">欢迎来到多为心理咨询室</h2>

                            <!-- 开场白建议 -->
                            <div class="d-flex flex-wrap justify-center mt-4 mx-2" style="max-width: 300px;">
                                <v-chip v-for="suggestion in suggestions" :key="suggestion" class="ma-1"
                                    variant="outlined" color="secondary" @click="setSuggestion(suggestion)">
                                    {{ suggestion }}
                                </v-chip>
                            </div>
                        </div>

                        <!-- 消息列表 -->
                        <template v-else>
                            <template v-for="(message, index) in chatService.local_messages.value" :key="index">
                                <!-- 用户 -->
                                <div v-if="message.role === 'user'" class="d-flex justify-end mb-4">
                                    <v-card variant="tonal" color="primary" class="d-inline-block pa-1"
                                        style="max-width: 70%;">
                                        <v-card-text class="pa-2"
                                            style="overflow-wrap: break-word; word-break: break-word; white-space: pre-wrap;">
                                            <div v-html="message.content"></div>
                                        </v-card-text>
                                    </v-card>
                                    <v-avatar class="mx-2" color="primary" icon="mdi-account" size="36px" />
                                </div>
                                <!-- 咨询师 -->
                                <div v-else-if="message.role === 'assistant'" class="d-flex justify-start mb-4">
                                    <v-avatar class="mx-2" color="blue" icon="mdi-head-heart" size="36px" />
                                    <v-card class="d-inline-block pa-1" style="max-width: 70%;">
                                        <v-card-text class="pa-2"
                                            style="overflow-wrap: break-word; word-break: break-word; white-space: pre-wrap;">
                                            <div v-html="message.content"></div>
                                        </v-card-text>
                                    </v-card>
                                </div>
                            </template>
                        </template>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>

        <!-- 编辑框 -->
        <v-footer app color="transparent" class="px-4 d-flex flex-column">
            <v-card width="100%">
                <v-textarea v-model="chatService.editorText.value" placeholder="输入消息..." rows="1" auto-grow hide-details
                    variant="solo" flat @keydown="handleKeydown">
                </v-textarea>
                <v-card-actions class="pa-1 px-2">
                    <v-spacer></v-spacer>
                    <v-btn @click="chatService.send()" :disabled="!chatService.editorText.value.trim()" variant="flat"
                        color="primary" icon="mdi-send" size="x-small" />
                </v-card-actions>
            </v-card>
            <p class="text-center text-caption text-grey">内容由AI生成，请注意甄别！您的隐私将受到严格保护，产生的任何数据只会保存在本地！</p>
        </v-footer>
    </v-app>
</template>

<script setup lang="ts">
import { nextTick, watch } from 'vue'
import { chatService } from '@/utils/chatService'

// 常见开场白建议
const suggestions = ["最近感到压力很大", "睡眠质量不好", "工作焦虑", "人际关系困扰", "情绪低落", "家庭矛盾"]

// 处理键盘事件
function handleKeydown(event: KeyboardEvent) {
    // Shift + Enter 换行
    if (event.shiftKey && event.key === 'Enter') {
        return
    }

    // Enter 发送消息
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        chatService.send()
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
    () => chatService.local_messages.value,
    () => {
        nextTick(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            })
        })
    },
)

// TODO
import { toolService } from '@/utils/toolService'
console.log(toolService.parse('{"think": ["value"]}'))
</script>