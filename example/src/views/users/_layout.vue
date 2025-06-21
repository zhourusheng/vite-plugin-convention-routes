<template>
  <div class="users-layout">
    <div class="layout-header">
      <h1>用户模块</h1>
      <nav class="layout-nav">
        <router-link to="/users" exact-active-class="router-link-exact-active">用户列表</router-link>
        <router-link :to="`/users/1`" :class="{ 'active-route': isActiveRoute('1') }">张三</router-link>
        <router-link :to="`/users/2`" :class="{ 'active-route': isActiveRoute('2') }">李四</router-link>
        <router-link :to="`/users/3`" :class="{ 'active-route': isActiveRoute('3') }">王五</router-link>
      </nav>
    </div>
    
    <div class="layout-content">
      <!-- 子路由内容将在这里渲染 -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

// 判断当前路由是否匹配指定的用户ID
const isActiveRoute = (userId: string) => {
  // 检查路由参数中的id是否匹配
  return route.params.id === userId
}
</script>

<style scoped>
.users-layout {
  display: flex;
  flex-direction: column;
  border: 2px solid #3498db;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.layout-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.layout-header h1 {
  color: #3498db;
  margin-bottom: 15px;
}

.layout-nav {
  display: flex;
  gap: 15px;
}

.layout-nav a {
  text-decoration: none;
  color: #333;
  padding: 5px 10px;
  border-radius: 4px;
  background-color: #f0f0f0;
  transition: all 0.3s ease;
}

.layout-nav a:hover,
.layout-nav a.router-link-exact-active,
.layout-nav a.active-route {
  background-color: #3498db;
  color: white;
}

.layout-content {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
}
</style> 