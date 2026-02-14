<template>
  <router-view />
  <Snackbar />
  <Dialog />
  <ApiKeyGuide />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Snackbar from '@/components/global/snackbar.vue';
import Dialog from '@/components/global/dialog.vue';
import ApiKeyGuide from '@/components/global/ApiKeyGuide.vue';
import { useApiKeyGuide } from '@/components/global/apiKeyGuideService';

const apiKeyGuide = useApiKeyGuide()

// 应用启动时自动检查是否需要显示 API Key 引导
onMounted(() => {
    apiKeyGuide.checkAndShow()
})
</script>