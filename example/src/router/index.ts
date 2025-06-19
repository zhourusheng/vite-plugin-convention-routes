import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 这里的routes数组会被插件自动替换为约定式路由
const routes: RouteRecordRaw[] = []

export const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 