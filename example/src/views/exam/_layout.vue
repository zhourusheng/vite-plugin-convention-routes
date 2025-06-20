<template>
  <div class="exam-layout">
    <div class="layout-header">
      <h1>考试系统</h1>
      <nav class="layout-nav">
        <router-link to="/exam">课程列表</router-link>
        <router-link to="/exam/math">数学课程</router-link>
        <router-link to="/exam/english">英语课程</router-link>
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
// 考试模块的布局组件
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
.layout-nav a.router-link-active {
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