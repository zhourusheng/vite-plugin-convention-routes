<template>
  <div class="user-detail">
    <h2>用户详情</h2>
    <div v-if="user">
      <p><strong>ID:</strong> {{ user.id }}</p>
      <p><strong>姓名:</strong> {{ user.name }}</p>
      <p><strong>邮箱:</strong> {{ user.email }}</p>
    </div>
    <div v-else>
      <p>加载中...</p>
    </div>
    <button @click="goBack">返回列表</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const user = ref<any>(null)

// 模拟API请求获取用户数据
onMounted(() => {
  // 从路由参数获取用户ID
  const userId = route.params.id
  
  // 模拟API调用
  setTimeout(() => {
    // 假数据
    user.value = {
      id: userId,
      name: userId === '1' ? '张三' : userId === '2' ? '李四' : '王五',
      email: `user${userId}@example.com`
    }
  }, 500)
})

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.user-detail {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

button {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0055aa;
}
</style> 