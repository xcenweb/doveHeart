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

            <v-list nav class="pa-2">
                <v-list-item prepend-icon="mdi-message-text-outline" title="咨询室" value="chat" rounded="lg"
                    color="primary" active />
                <v-list-item prepend-icon="mdi-history" title="历史记录" value="history" rounded="lg" disabled />
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
            <v-app-bar-title class="font-weight-bold">咨询室</v-app-bar-title>
            <v-btn icon="mdi-cog" variant="text" class="d-md-none" @click="$router.push('/setting')" />
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
                    <MessageBubble
                        v-for="(message, index) in visibleMessages"
                        :key="index"
                        :message="message"
                        :is-thinking="chatService.status.value === 'thinking'"
                    />
                </div>

            </v-container>
        </v-main>

        <!-- 底部输入区 -->
        <ChatInput ref="chatInputRef" />
    </v-app>
</template>

<script setup lang="ts">
import { nextTick, watch, ref, computed } from 'vue'
import { chatService } from '@/utils/chatService'
import { useDisplay } from 'vuetify'
import MessageBubble from '@/components/chat/MessageBubble.vue'
import ChatInput from '@/components/chat/ChatInput.vue'

const { mdAndUp } = useDisplay()
const drawer = ref(mdAndUp.value)
const chatInputRef = ref<InstanceType<typeof ChatInput>>()

const suggestions = ['最近感到压力很大', '睡眠质量不好', '工作焦虑', '人际关系困扰', '情绪低落', '家庭矛盾']

const visibleMessages = computed(() => 
    chatService.messages.value.filter(m => m.visible !== false && m.role !== 'system')
)

function setSuggestion(suggestion: string) {
    chatService.editorText.value = suggestion
    chatInputRef.value?.focusInput()
}

// 自动滚动到底部
function scrollToBottom() {
    nextTick(() => {
        // 使用 window 滚动到页面底部
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
</script>
