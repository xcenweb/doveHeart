<template>
    <v-main class="d-flex flex-column">
        <!-- 空状态 -->
        <v-container v-if="chatService.messages.value.length <= 1"
            class="pa-4 pa-sm-6 flex-grow-1 d-flex align-center justify-center" max-width="800px">
            <div class="d-flex flex-column align-center justify-center text-center">
                <v-avatar size="100" color="primary" variant="tonal" class="mb-6">
                    <v-icon size="56">mdi-head-heart</v-icon>
                </v-avatar>
                <h1 class="text-h5 font-weight-bold mb-3">欢迎来到心理咨询室</h1>
                <v-card variant="flat" class="rounded-xl pa-3" style="max-width: 420px;">
                    <div class="text-caption text-medium-emphasis mb-3 d-flex align-center">
                        <v-icon size="16" start icon="mdi-lightbulb-outline" />
                        试试从这些话题开始对话
                    </div>
                    <div class="d-flex flex-wrap ga-1">
                        <v-chip :text="suggestion" v-for="suggestion in suggestions" :key="suggestion" size="small"
                            variant="tonal" color="primary" class="rounded-lg" @click="setSuggestion(suggestion)" />
                    </div>
                </v-card>
            </div>
        </v-container>

        <!-- 消息列表 -->
        <v-container v-else class="pa-4 pa-sm-6" max-width="800px">
            <div class="d-flex flex-column ga-4">
                <ChatBubble v-for="(message, index) in chatService.messages.value" :key="index" :message="message" />
            </div>
        </v-container>
    </v-main>
</template>

<script setup lang="ts">
import { watch, nextTick } from 'vue'
import { chatService } from '@/utils/chatService'
import ChatBubble from './Bubble.vue'

const suggestions = ['最近感到压力很大', '睡眠质量不好', '工作焦虑', '人际关系困扰', '情绪低落', '家庭矛盾']

function setSuggestion(suggestion: string) {
    chatService.editbox.value = suggestion
    nextTick(() => {
        const textarea = document.querySelector('textarea')
        if (textarea) textarea.focus()
    })
}

function scrollToBottom() {
    nextTick(() => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        })
    })
}

watch(
    [
        () => chatService.messages.value.length,
        () => chatService.messages.value.map(m => m.content).join('')
    ],
    () => {
        scrollToBottom()
    }
)
</script>
