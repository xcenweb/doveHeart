<template>
    <v-navigation-drawer v-model="drawer" :permanent="$vuetify.display.mdAndUp" :temporary="$vuetify.display.smAndDown">
        <template #prepend>
            <div class="pa-4">
                <div class="d-flex align-center ga-3">
                    <v-avatar size="48" rounded="lg">
                        <v-img src="/logo.svg" />
                    </v-avatar>
                    <div class="font-weight-bold">多为智心</div>
                    <div class="text-caption text-medium-emphasis">心理健康助手</div>
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
            <v-list-item v-for="room in rooms" :key="room.id" :title="room.name"
                :active="chatService.currentRoomId.value === room.id" rounded="lg" color="primary"
                @click="enterRoom(room.id!)">
                <template #prepend>
                    <v-icon :icon="room.isPinned ? 'mdi-pin' : 'mdi-forum'" />
                </template>
                <template #append>
                    <v-menu v-model="room.menuOpen" :close-on-content-click="false" activator="parent">
                        <template #activator="{ props: menuProps }">
                            <v-btn icon="mdi-dots-horizontal" variant="text" size="x-small" v-bind="menuProps" />
                        </template>
                        <v-list density="compact">
                            <v-list-item v-if="!room.isPinned" prepend-icon="mdi-pin" title="置顶"
                                @click="togglePinRoom(room)" />
                            <v-list-item v-else prepend-icon="mdi-pin-off" title="取消置顶" @click="togglePinRoom(room)" />
                            <v-list-item prepend-icon="mdi-pencil" title="重命名" @click="openRenameDialog(room)" />
                            <v-list-item prepend-icon="mdi-delete" title="删除" class="text-error"
                                @click="openDeleteDialog(room)" />
                        </v-list>
                    </v-menu>
                </template>
            </v-list-item>
        </v-list>

        <template #append>
            <div class="pa-2">
                <v-btn block variant="tonal" color="primary" prepend-icon="mdi-cog" class="rounded-lg"
                    @click="$router.push('/setting')">
                    设置
                </v-btn>
            </div>
        </template>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { chatService, type ChatRoom } from '@/utils/chatService'
import { useDialog } from '@/components/global/dialogService'

const router = useRouter()
const dialog = useDialog()

type RoomWithMenu = ChatRoom & { menuOpen?: boolean }

const props = defineProps<{
    modelValue: boolean
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'roomCreated': []
}>()

const drawer = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const rooms = ref<RoomWithMenu[]>([])

// 加载咨询室列表
async function loadRooms() {
    rooms.value = await chatService.getRooms()
}

// 进入咨询室
function enterRoom(roomId: number) {
    router.push(`/room/${roomId}`)
}

// 创建草稿状态新咨询室
function createNewRoom() {
    chatService.createRoom()
    router.push('/')
}

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

// 切换咨询室置顶状态
async function togglePinRoom(room: RoomWithMenu) {
    room.menuOpen = false
    await chatService.togglePinRoom(room.id!, !room.isPinned)
    await loadRooms()
}

// 暴露方法供父组件调用
defineExpose({
    loadRooms
})
</script>
