<template>
  <div class="about-page">
    <h1>关于我们</h1>
    <p>这是一个演示如何使用导出变量定义路由元数据的示例组件</p>
  </div>
</template>

<script>
// 使用导出变量的方式定义路由元数据
export const routeMeta = {
  title: '关于我们页面',
  icon: 'info-circle',
  isPublic: true,
  noCache: true
}

export default {
  name: 'AboutPage'
}
</script>

<style>
.about-page {
  padding: 20px;
  background-color: #f5f5f5;
}
</style> 