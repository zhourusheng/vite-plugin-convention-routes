<template>
  <div class="user-detail" :key="route.path">
    <h2>用户详情</h2>
    <div v-if="user">
      <p><strong>ID:</strong> {{ user.id }}</p>
      <p><strong>姓名:</strong> {{ user.name }}</p>
      <p><strong>邮箱:</strong> {{ user.email }}</p>
    </div>
    <div v-else>
      <p>加载中...</p>
    </div>
    <button @click="goBack">返回用户列表</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const user = ref<any>(null)

// 加载用户数据的函数
const loadUserData = (userId: string) => {
  console.log('加载用户数据:', userId) // 调试日志
  user.value = null // 重置用户数据，显示加载状态
  
  // 模拟API调用
  setTimeout(() => {
    // 假数据
    user.value = {
      id: userId,
      name: userId === '1' ? '张三' : userId === '2' ? '李四' : '王五',
      email: `user${userId}@example.com`
    }
    console.log('用户数据已加载:', user.value) // 调试日志
  }, 500)
}

// 初始加载
onMounted(() => {
  const userId = route.params.id as string
  loadUserData(userId)
})

// 使用深度监听确保能捕获到所有变化
watch(
  () => route.params,
  (newParams) => {
    const newId = newParams.id
    if (newId) {
      console.log('路由参数变化:', newId) // 调试日志
      loadUserData(newId as string)
    }
  },
  { deep: true, immediate: true }
)

// 返回上一页
const goBack = () => {
  router.push('/users')
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