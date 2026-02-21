<template>
    <v-app>
        <!-- 导航栏抽屉 -->
        <ChatDrawer />

        <!-- 主内容区 -->
        <ChatContent />

        <!-- 底部输入区 -->
        <ChatInput />
    </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { chatService } from '@/utils/chatService'

import ChatContent from '@/components/chat/Content.vue'
import ChatInput from '@/components/chat/Input.vue'
import ChatDrawer from '@/components/chat/Drawer.vue'

import { useApiKeyGuide } from '@/components/global/apiKeyGuideService'
const apiKeyGuide = useApiKeyGuide()
onMounted(async () => {
    apiKeyGuide.check()
    chatService.create()
})
</script>
