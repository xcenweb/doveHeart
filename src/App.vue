<template>
  <router-view />
  <Snackbar />
</template>

<script setup lang="ts">
import Snackbar from '@/components/global/snackbar.vue';
</script>

<style>
* {
  overflow: visible !important; /* 或 auto */
}
</style>