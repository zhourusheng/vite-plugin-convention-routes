<template>
  <div class="user-detail">
    <h1>用户详情页</h1>
    <p>用户ID: {{ $route.params.id }}</p>
    <p>这是一个演示动态路由参数和元数据的示例页面</p>
  </div>
</template>

<script>
/* route-meta
{
  "title": "用户详情",
  "keepAlive": false,
  "parentPath": "/users",
  "breadcrumb": true,
  "cache": false
}
*/
export default {
  name: 'UserDetail'
}
</script>

<style>
.user-detail {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin: 20px;
}
</style> 