import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'main',
            component: () => import('@/views/main.vue'),
        },
        {
            path: '/setting',
            name: 'setting',
            component: () => import('@/views/setting.vue')
        },
    ]
})

export default router