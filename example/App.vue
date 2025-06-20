<template>
  <div class="app">
    <Header />
    
    <main>
      <router-view></router-view>
    </main>
    
    <footer>
      <p>约定式路由插件演示 - {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 导入Header组件
import Header from './views/components/Header.vue'
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
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