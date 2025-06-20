<template>
  <div class="home-page">
    <h1>欢迎使用约定式路由插件</h1>
    
    <div class="feature-cards">
      <div class="card">
        <h2>用户管理</h2>
        <p>查看用户列表和用户详情</p>
        <router-link to="/users" class="card-link">进入用户管理</router-link>
      </div>
      
      <div class="card">
        <h2>考试系统</h2>
        <p>浏览课程和章节考试</p>
        <router-link to="/exam" class="card-link">进入考试系统</router-link>
      </div>
      
      <div class="card">
        <h2>关于我们</h2>
        <p>了解更多关于本项目的信息</p>
        <router-link to="/about" class="card-link">查看详情</router-link>
      </div>
    </div>
    
    <div class="plugin-info">
      <h3>约定式路由插件特点</h3>
      <ul>
        <li>自动根据文件结构生成路由配置</li>
        <li>支持动态路由参数，包括多级嵌套参数</li>
        <li>零配置，即插即用</li>
        <li>支持热更新</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// 首页组件
</script>

<style scoped>
.home-page {
  padding: 20px 0;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.card h2 {
  color: #0066cc;
  margin-top: 0;
}

.card p {
  color: #666;
  margin-bottom: 20px;
}

.card-link {
  display: inline-block;
  background-color: #0066cc;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.card-link:hover {
  background-color: #0055aa;
  color: white;
}

.plugin-info {
  background-color: #f0f7ff;
  border-radius: 8px;
  padding: 20px;
  margin-top: 30px;
}

.plugin-info h3 {
  color: #0066cc;
  margin-top: 0;
}

.plugin-info ul {
  color: #444;
  padding-left: 20px;
}

.plugin-info li {
  margin-bottom: 8px;
}
</style> 