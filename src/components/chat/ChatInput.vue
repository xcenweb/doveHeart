<template>
    <v-footer app color="transparent" class="pa-0">
        <v-container class="pa-3 pa-sm-4" style="max-width: 900px;">
            <v-card variant="flat" class="rounded-xl">
                <v-textarea v-model="chatService.editorText.value" placeholder="想聊点什么..."
                    rows="1" max-rows="6" auto-grow hide-details variant="plain" class="px-4 pb-0"
                    @keydown="handleKeydown" />
                <div class="d-flex align-center pa-2">
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


</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { chatService } from '@/utils/chatService'
import { settingService } from '@/utils/settingService'

const settings = ref(settingService.getAll())


function handleSend() {
    const provider = settings.value.provider
    const apiKey = settings.value.apiKeys?.[provider] || ''

    if (!apiKey) {
        // 如果没有 API 密钥，直接发送（可能会失败，但不显示弹窗）
        chatService.send()
        return
    }

    chatService.send()
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
