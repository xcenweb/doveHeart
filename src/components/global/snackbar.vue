<template>
  <!-- 全局 Snackbar 消息提示组件 -->
  <v-snackbar v-model="snackbar.visible.value" :color="snackbar.color.value"
    :timeout="snackbar.timeout.value" location="top" transition="slide-y-transition" rounded="lg" min-width="40px">
    <v-row class="align-center" no-gutters>
      <v-col cols="auto" v-if="snackbar.showProgress.value">
        <v-progress-circular indeterminate size="20" width="3" class="mr-3 ml-1" />
      </v-col>
      <v-col>
        <p>{{ snackbar.message.value }}</p>
      </v-col>
    </v-row>
    <template v-slot:actions>
      <v-btn icon="mdi-close" @click="snackbar.hide()" size="small" color="grey-darken-2" />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useSnackbar } from '@/components/global/snackbarService'
const snackbar = useSnackbar()
</script>