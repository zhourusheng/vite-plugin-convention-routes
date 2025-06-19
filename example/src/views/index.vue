<template>
  <div class="home-page">
    <h1>首页</h1>
    <nav>
      <router-link to="/">首页</router-link> | 
      <router-link to="/about">关于</router-link> | 
      <router-link to="/users">用户列表</router-link> | 
      <router-link to="/users/1">用户详情</router-link>
    </nav>
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
// 首页组件
</script>

<style scoped>
.home-page {
  padding: 20px;
}

nav {
  margin-bottom: 20px;
}

nav a {
  margin: 0 10px;
}

.content {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style> 