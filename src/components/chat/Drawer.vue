<template>
    <v-navigation-drawer v-model="drawer" mobile-breakpoint="md" app>
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

        <template #append>
            <div class="pa-2">
                <v-btn block variant="tonal" color="primary" prepend-icon="mdi-cog" class="rounded-lg"
                    @click="$router.push('/setting')">
                    设置
                </v-btn>
            </div>
        </template>
    </v-navigation-drawer>

    <v-app-bar app>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        <v-app-bar-title text="咨询室" />
    </v-app-bar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()
const drawer = ref(mdAndUp.value)

</script>
