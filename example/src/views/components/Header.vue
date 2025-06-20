<template>
  <header class="app-header">
    <h1>约定式路由示例</h1>
    <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
      <router-link to="/users">用户</router-link>
      <router-link to="/exam">考试</router-link>
    </nav>
  </header>
</template>

<script setup lang="ts">
// 这是一个组件，不应该被添加到路由配置中
</script>

<style scoped>
.app-header {
  padding: 1rem;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
}

nav {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

a {
  text-decoration: none;
  color: #333;
  padding: 0.5rem;
  border-radius: 4px;
}

a.router-link-active {
  background-color: #333;
  color: white;
}
</style> 