<template>
  <div class="users-page">
    <h2>用户列表</h2>
    <ul>
      <li v-for="user in users" :key="user.id">
        <router-link :to="`/users/${user.id}`">{{ user.name }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 模拟用户数据
const users = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
])
</script>

<style scoped>
.users-page {
  padding: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 10px 0;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style> 