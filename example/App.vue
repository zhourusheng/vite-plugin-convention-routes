<template>
  <div class="app">
    <header>
      <h1>Vite 约定式路由插件示例</h1>
      <nav class="main-nav">
        <router-link to="/">首页</router-link>
        <router-link to="/about">关于</router-link>
        <router-link to="/users">用户列表</router-link>
        <router-link to="/exam">考试系统</router-link>
      </nav>
    </header>
    
    <main>
      <router-view></router-view>
    </main>
    
    <footer>
      <p>约定式路由插件演示 - {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// App根组件
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

header {
  background-color: #0066cc;
  color: white;
  padding: 1rem 2rem;
  text-align: center;
}

header h1 {
  color: white;
  margin-bottom: 1rem;
}

.main-nav {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
}

.main-nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.main-nav a:hover,
.main-nav a.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

footer {
  background-color: #0066cc;
  color: white;
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
}
</style> 