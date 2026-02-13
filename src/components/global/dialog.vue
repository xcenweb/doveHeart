<template>
    <v-dialog v-model="dialog.visible.value" max-width="400" persistent>
        <v-card class="rounded-xl pa-4">
            <v-card-title class="text-h6 font-weight-bold pb-2">
                {{ dialog.config.value.title }}
            </v-card-title>

            <v-card-text class="text-medium-emphasis pb-6">
                <!-- 文本内容 -->
                <p v-if="dialog.config.value.text">{{ dialog.config.value.text }}</p>

                <!-- 输入框 -->
                <v-text-field
                    v-if="dialog.config.value.type === 'prompt'"
                    v-model="dialog.inputValue.value"
                    :placeholder="dialog.config.value.placeholder"
                    variant="outlined"
                    class="mt-2"
                />
            </v-card-text>

            <v-card-actions class="px-0 ga-2">
                <v-spacer />
                <v-btn
                    v-if="dialog.config.value.type !== 'alert'"
                    variant="text"
                    @click="dialog.cancel()"
                    class="px-6 rounded-pill"
                >
                    {{ dialog.config.value.cancelText || '取消' }}
                </v-btn>
                <v-btn
                    :color="dialog.config.value.color || 'primary'"
                    variant="flat"
                    @click="dialog.confirm()"
                    class="px-6 rounded-pill"
                >
                    {{ dialog.config.value.confirmText || '确定' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { useDialog } from './dialogService'

const dialog = useDialog()
</script>
