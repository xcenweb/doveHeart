<template>
  <router-view />
  <Snackbar />
</template>

<script setup lang="ts">
import Snackbar from '@/components/global/snackbar.vue';
</script>

<style>
/* 移除了全局 overflow 样式，以允许正常的滚动行为 */
</style>