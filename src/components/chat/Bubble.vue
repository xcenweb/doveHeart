<template>

    <!-- 用户发送的消息 -->
    <div v-if="message.role === 'user'" class="d-flex justify-end ga-2">
        <v-card variant="flat" color="primary" class="rounded-xl rounded-te-sm" max-width="75%">
            <v-card-text class="pa-3 text-body-2 text-pre-wrap">
                {{ message.content }}
            </v-card-text>
        </v-card>
        <v-avatar size="36" color="primary" variant="tonal" class="flex-shrink-0">
            <v-icon size="20" icon="mdi-account" />
        </v-avatar>
    </div>

    <!-- 助手发送的消息 -->
    <div v-else-if="message.role === 'assistant'" class="d-flex justify-start ga-2">
        <v-avatar size="36" color="secondary" variant="tonal" class="flex-shrink-0">
            <v-icon size="20" icon="mdi-head-heart" />
        </v-avatar>
        <v-card variant="flat" class="rounded-xl rounded-ts-sm" max-width="70%">

            <!-- 加载中显示 -->
            <div v-if="message.status === 'loading' && !message.content" class="pa-3 d-flex align-center ga-1">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>

            <!-- 消息内容 -->
            <v-card-text v-else class="pa-3 text-body-2 text-pre-wrap">
                {{ message.content }}
            </v-card-text>

        </v-card>
        <v-icon v-if="message.status === 'error'" size="20" icon="mdi-alert-circle" class="mt-auto mb-auto" color="error"/>
    </div>

</template>

<script setup lang="ts">
import { type Message } from '@/utils/chatService'

defineProps<{
    message: Message
}>()
</script>

<style scoped>
.dot {
    width: 8px;
    height: 8px;
    background-color: rgb(var(--v-theme-primary));
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) {
    animation-delay: -0.32s;
}

.dot:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes bounce {
    0%, 80%, 100% {
        transform: scale(0.6);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}
</style>