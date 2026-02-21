<template>
    <v-footer app color="transparent" class="pa-0">
        <v-container class="py-2" max-width="800px">
            <v-card variant="flat" class="rounded-xl">
                <v-textarea v-model="chatService.editbox.value" placeholder="想聊点什么..."
                    rows="1" max-rows="6" auto-grow hide-details variant="plain" class="px-4 pb-0 pt-0"
                    @keydown="handleKeydown" />
                <div class="d-flex align-center pa-2">
                    <v-spacer />

                    <!-- 发送按钮 -->
                    <v-btn @click="handleSend" :disabled="!chatService.editbox.value.trim()"
                        variant="flat" color="primary" icon="mdi-send" size="x-small" class="rounded-lg" />
                </div>
            </v-card>
            <p class="text-center text-caption text-medium-emphasis mt-1">
                内容由AI生成，仅供参考
            </p>
        </v-container>
    </v-footer>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import { chatService } from '@/utils/chatService'

async function handleSend() {
    const text = chatService.editbox.value.trim()
    if (!text) return

    await chatService.getReply(text)
}

function handleKeydown(event: KeyboardEvent) {
    if (event.shiftKey && event.key === 'Enter') return
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        handleSend()
    }
}

function focusInput() {
    nextTick(() => {
        const textarea = document.querySelector('textarea')
        if (textarea) textarea.focus()
    })
}

defineExpose({ focusInput })
</script>
