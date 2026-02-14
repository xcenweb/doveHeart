<template>
    <v-app>
        <!-- 导航抽屉 -->
        <ChatDrawer v-model="drawer" ref="drawerRef" />

        <!-- 应用栏 -->
        <v-app-bar flat app>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
            <v-app-bar-title text="咨询室" />
        </v-app-bar>

        <!-- 主内容区 -->
        <ChatContent @selectSuggestion="setSuggestion" />

        <!-- 底部输入区 -->
        <ChatInput ref="chatInputRef" @roomCreated="loadRooms" />
    </v-app>
</template>

<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { chatService } from '@/utils/chatService'
import { useDisplay } from 'vuetify'

import ChatContent from '@/components/chat/Content.vue'
import ChatInput from '@/components/chat/Input.vue'
import ChatDrawer from '@/components/chat/Drawer.vue'

const route = useRoute()
const { mdAndUp } = useDisplay()

const drawer = ref(mdAndUp.value)
const chatInputRef = ref<InstanceType<typeof ChatInput>>()
const drawerRef = ref<InstanceType<typeof ChatDrawer>>()

// 加载咨询室列表
async function loadRooms() {
    await drawerRef.value?.loadRooms()
}

// 设置编辑器提示
function setSuggestion(suggestion: string) {
    chatService.editorText.value = suggestion
    chatInputRef.value?.focusInput()
}

// 监听路由变化
watch(() => route.params.id,
    async (newId) => {
        if (newId) {
            const roomId = parseInt(newId as string)
            await chatService.switchRoom(roomId)
            await loadRooms()
        } else {
            await chatService.switchRoom(null)
        }
    },
    { immediate: true }
)

// 页面加载时检查
onMounted(async () => {
    await loadRooms()
})
</script>
