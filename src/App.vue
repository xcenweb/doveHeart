<template>
  <router-view />
  <Snackbar />
  <Dialog />
  <ApiKeyGuide />
</template>

<script setup lang="ts">
import Snackbar from '@/components/global/snackbar.vue';
import Dialog from '@/components/global/dialog.vue';
import ApiKeyGuide from '@/components/global/ApiKeyGuide.vue';
</script>