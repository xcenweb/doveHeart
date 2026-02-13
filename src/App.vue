<template>
  <router-view />
  <Snackbar />
  <Dialog />
</template>

<script setup lang="ts">
import Snackbar from '@/components/global/snackbar.vue';
import Dialog from '@/components/global/dialog.vue';
</script>