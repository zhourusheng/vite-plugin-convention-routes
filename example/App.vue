<template>
  <div class="app">
    <header>
      <h1>Vite 约定式路由插件示例</h1>
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
}

header {
  background-color: #333;
  color: white;
  padding: 1rem;
  text-align: center;
}

main {
  flex: 1;
  padding: 1rem;
}

footer {
  background-color: #333;
  color: white;
  padding: 1rem;
  text-align: center;
  font-size: 0.8rem;
}
</style> 