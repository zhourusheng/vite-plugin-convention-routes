<template>
  <div class="chapter-list">
    <h2>《{{ courseTitle }}》章节列表</h2>
    <ul>
      <li v-for="chapter in chapters" :key="chapter.id">
        <router-link :to="`/exam/${courseId}/${chapter.id}`">{{ chapter.title }}</router-link>
      </li>
    </ul>
    <button @click="goBack">返回课程列表</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const courseId = computed(() => route.params.courseId as string)
const courseTitle = ref('')
const chapters = ref([])

// 模拟获取课程章节数据
onMounted(() => {
  // 获取路由参数中的课程ID
  const id = courseId.value

  // 根据课程ID获取章节列表
  if (id === '1') {
    courseTitle.value = '前端开发课程'
    chapters.value = [
      { id: '101', title: 'HTML基础' },
      { id: '102', title: 'CSS进阶' },
      { id: '103', title: 'JavaScript核心' }
    ]
  } else if (id === '2') {
    courseTitle.value = '后端开发课程'
    chapters.value = [
      { id: '201', title: 'Node.js基础' },
      { id: '202', title: '数据库设计' },
      { id: '203', title: 'API开发' }
    ]
  } else {
    courseTitle.value = '移动开发课程'
    chapters.value = [
      { id: '301', title: 'React Native入门' },
      { id: '302', title: 'Flutter开发' },
      { id: '303', title: '混合应用开发' }
    ]
  }
})

// 返回上一页
const goBack = () => {
  router.push('/exam')
}
</script>

<style scoped>
.chapter-list {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

h2 {
  margin-bottom: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
  margin-bottom: 20px;
}

li {
  margin-bottom: 10px;
}

a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
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