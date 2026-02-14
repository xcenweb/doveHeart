<template>
    <v-footer app color="transparent" class="pa-0">
        <v-container class="py-2" max-width="800px">
            <v-card variant="flat" class="rounded-xl">
                <v-textarea v-model="chatService.editorText.value" placeholder="想聊点什么..."
                    rows="1" max-rows="6" auto-grow hide-details variant="plain" class="px-4 pb-0 pt-0"
                    @keydown="handleKeydown" />
                <div class="d-flex align-center pa-2">
                    <v-spacer />

                    <!-- 发送按钮 -->
                    <v-btn @click="handleSend" :disabled="!chatService.editorText.value.trim()"
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
import { useRouter } from 'vue-router'
import { chatService } from '@/utils/chatService'

const emit = defineEmits<{
    (e: 'roomCreated'): void
}>()

const router = useRouter()

async function handleSend() {
    const text = chatService.editorText.value.trim()
    if (!text) return

    const oldRoomId = chatService.currentRoomId.value
    await chatService.getReply(text)

    // 如果创建了新咨询室（从 null 或 -1 变成有效ID），跳转路由并刷新列表
    const newRoomId = chatService.currentRoomId.value
    const wasNullOrDraft = oldRoomId === null || oldRoomId === -1
    if (wasNullOrDraft && newRoomId !== null && newRoomId > 0) {
        router.push(`/room/${newRoomId}`)
        emit('roomCreated')
    }
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
