<template>
  <div class="exam-layout">
    <div class="layout-header">
      <h1>考试系统</h1>
      <nav class="layout-nav">
        <router-link to="/exam" exact-active-class="router-link-exact-active">课程列表</router-link>
        <router-link :to="`/exam/1`" :class="{ 'active-route': isActiveRoute('1') }">前端</router-link>
        <router-link :to="`/exam/2`" :class="{ 'active-route': isActiveRoute('2') }">后端</router-link>
        <router-link :to="`/exam/3`" :class="{ 'active-route': isActiveRoute('3') }">移动端</router-link>
      </nav>
    </div>
    
    <div class="layout-content">
      <!-- 子路由内容将在这里渲染 -->
      <router-view></router-view>
    </div>
    
    <div class="layout-footer">
      <p>考试系统 © {{ new Date().getFullYear() }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

// 判断当前路由是否匹配指定的课程ID
const isActiveRoute = (courseId: string) => {
  // 检查路由参数中的courseId是否匹配
  return route.params.courseId === courseId
}
</script>

<style scoped>
.exam-layout {
  display: flex;
  flex-direction: column;
  border: 2px solid #e74c3c;
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
  color: #e74c3c;
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
  background-color: #e74c3c;
  color: white;
}

.layout-content {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  flex: 1;
}

.layout-footer {
  text-align: center;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
  color: #777;
  font-size: 0.9rem;
}
</style> 