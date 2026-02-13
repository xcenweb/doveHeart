<template>
    <v-app>

        <!-- 导航抽屉 -->
        <v-navigation-drawer v-model="drawer" :permanent="$vuetify.display.mdAndUp" :temporary="$vuetify.display.smAndDown">
            <template v-slot:prepend>
                <div class="pa-4">
                    <div class="d-flex align-center ga-3">
                        <v-avatar size="48" rounded="lg">
                            <v-img src="/logo.svg" />
                        </v-avatar>
                        <div>
                            <div class="font-weight-bold">多为智心</div>
                            <div class="text-caption text-medium-emphasis">心理健康助手</div>
                        </div>
                    </div>
                </div>
            </template>

            <v-divider />

            <!-- 咨询室列表 -->
            <v-list nav class="pa-2" subheader>
                <div class="d-flex justify-space-between align-center mb-1">
                    <v-list-subheader class="pa-0">咨询室</v-list-subheader>
                    <v-btn icon="mdi-plus" variant="text" size="small" @click="createNewRoom" />
                </div>
                <v-list-item
                    v-for="room in rooms"
                    :key="room.id"
                    :title="room.name"
                    :active="chatService.currentRoomId.value === room.id"
                    rounded="lg"
                    color="primary"
                    @click="enterRoom(room.id!)"
                >
                    <template v-slot:prepend>
                        <v-icon :icon="room.isPinned ? 'mdi-pin' : 'mdi-forum'" />
                    </template>
                    <template v-slot:append>
                        <v-menu v-model="room.menuOpen" :close-on-content-click="false" activator="parent">
                            <template v-slot:activator="{ props }">
                                <v-btn icon="mdi-dots-horizontal" variant="text" size="x-small" v-bind="props" />
                            </template>
                            <v-list density="compact">
                                <v-list-item v-if="!room.isPinned" prepend-icon="mdi-pin" title="置顶" @click="pinRoom(room)" />
                                <v-list-item v-else prepend-icon="mdi-pin-off" title="取消置顶" @click="unpinRoom(room)" />
                                <v-list-item prepend-icon="mdi-pencil" title="重命名" @click="openRenameDialog(room)" />
                                <v-list-item prepend-icon="mdi-delete" title="删除" class="text-error" @click="openDeleteDialog(room)" />
                            </v-list>
                        </v-menu>
                    </template>
                </v-list-item>
            </v-list>

            <template v-slot:append>
                <div class="pa-2">
                    <v-btn block variant="tonal" color="primary" prepend-icon="mdi-cog" class="rounded-lg"
                        @click="$router.push('/setting')">
                        设置
                    </v-btn>
                </div>
            </template>
        </v-navigation-drawer>

        <!-- 应用栏 -->
        <v-app-bar flat>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
            <v-app-bar-title class="font-weight-bold">{{ currentRoomName }}</v-app-bar-title>
        </v-app-bar>

        <!-- 主内容区 -->
        <v-main>
            <v-container class="pa-4 pa-sm-6" style="max-width: 900px;">

                <!-- 空状态 -->
                <div v-if="visibleMessages.length === 0"
                    class="d-flex flex-column align-center justify-center text-center" style="min-height: 70vh;">

                    <v-avatar size="100" color="primary" variant="tonal" class="mb-6">
                        <v-icon size="56">mdi-head-heart</v-icon>
                    </v-avatar>

                    <h1 class="text-h5 font-weight-bold mb-2">欢迎来到多为心理咨询室</h1>

                    <v-card variant="flat" class="rounded-xl pa-4" style="max-width: 420px;">
                        <div class="text-caption text-medium-emphasis mb-3 d-flex align-center">
                            <v-icon size="16" start>mdi-lightbulb-outline</v-icon>
                            试试这些话题开始对话
                        </div>
                        <div class="d-flex flex-wrap ga-2">
                            <v-chip v-for="suggestion in suggestions" :key="suggestion" variant="tonal"
                                color="primary" size="small" class="rounded-lg" @click="setSuggestion(suggestion)">
                                {{ suggestion }}
                            </v-chip>
                        </div>
                    </v-card>
                </div>

                <!-- 消息列表 -->
                <div v-else class="d-flex flex-column ga-4">
                    <ChatBubble v-for="(message, index) in visibleMessages" :key="index" :message="message" :status="chatService.status.value" />
                </div>

            </v-container>
        </v-main>

        <!-- 底部输入区 -->
        <ChatInput ref="chatInputRef" @roomCreated="loadRooms" />

        <!-- API Key 引导弹窗 -->
        <ApiKeyGuide v-model="showApiKeyGuide" @complete="onApiKeyConfigured"/>
    </v-app>
</template>

<script setup lang="ts">
import { nextTick, watch, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chatService } from '@/utils/chatService'
import { settingService } from '@/utils/settingService'
import { type ChatRoom } from '@/utils/dbService'
import { useDisplay } from 'vuetify'
import { useDialog } from '@/components/global/dialogService'
import ChatBubble from '@/components/ChatBubble.vue'
import ChatInput from '@/components/ChatInput.vue'
import ApiKeyGuide from '@/components/ApiKeyGuide.vue'

const route = useRoute()
const router = useRouter()
const { mdAndUp } = useDisplay()
const dialog = useDialog()

const drawer = ref(mdAndUp.value)
const chatInputRef = ref<InstanceType<typeof ChatInput>>()
const showApiKeyGuide = ref(false)
const rooms = ref<RoomWithMenu[]>([])

const suggestions = ['最近感到压力很大', '睡眠质量不好', '工作焦虑', '人际关系困扰', '情绪低落', '家庭矛盾']

const visibleMessages = computed(() =>
    chatService.messages.value.filter(m => m.role !== 'system')
)

const currentRoomName = computed(() => {
    if (chatService.currentRoomId.value === null) {
        return '咨询室'
    }
    const room = rooms.value.find(r => r.id === chatService.currentRoomId.value)
    return room?.name || '咨询室'
})

// 加载咨询室列表
async function loadRooms() {
    rooms.value = await chatService.getRooms()
}

// 进入咨询室
function enterRoom(roomId: number) {
    router.push(`/room/${roomId}`)
}

// 创建新咨询室（草稿状态，未写入数据库）
function createNewRoom() {
    chatService.createRoom()
}

type RoomWithMenu = ChatRoom & { menuOpen?: boolean }

// 打开重命名弹窗
async function openRenameDialog(room: RoomWithMenu) {
    room.menuOpen = false
    const result = await dialog.prompt('重命名咨询室', room.name)
    if (result.confirmed && result.value?.trim()) {
        await chatService.renameRoom(room.id!, result.value.trim())
        await loadRooms()
    }
}

// 打开删除弹窗
async function openDeleteDialog(room: RoomWithMenu) {
    room.menuOpen = false
    const result = await dialog.confirmDialog('删除咨询室', `确定要删除"${room.name}"吗？此操作不可恢复。`)
    if (result.confirmed) {
        await chatService.deleteRoom(room.id!)
        await loadRooms()
        router.push('/')
    }
}

// 置顶咨询室
async function pinRoom(room: RoomWithMenu) {
    room.menuOpen = false
    await chatService.pinRoom(room.id!)
    await loadRooms()
}

// 取消置顶
async function unpinRoom(room: RoomWithMenu) {
    room.menuOpen = false
    await chatService.unpinRoom(room.id!)
    await loadRooms()
}

function setSuggestion(suggestion: string) {
    chatService.editorText.value = suggestion
    chatInputRef.value?.focusInput()
}

// 自动滚动到底部
function scrollToBottom() {
    nextTick(() => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        })
    })
}

// 监听消息数量变化
watch(
    () => chatService.messages.value.length,
    () => {
        scrollToBottom()
    }
)

// 监听消息内容变化（用于流式输出）
watch(
    () => chatService.messages.value.map(m => m.content).join(''),
    () => {
        scrollToBottom()
    }
)

// 监听路由变化
watch(
    () => route.params.id,
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

// 检查是否需要显示 API Key 引导弹窗
function checkApiKeyGuide() {
    const settings = settingService.getAll()
    const apiKey = settings.apiKeys?.[settings.provider] || ''
    if (!apiKey) {
        showApiKeyGuide.value = true
    }
}

// API Key 配置完成回调
function onApiKeyConfigured() {
    console.log('API Key configured')
}

// 页面加载时检查
onMounted(async () => {
    await loadRooms()
    checkApiKeyGuide()
})
</script>
