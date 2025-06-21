<template>
  <div class="chapter-list" :key="route.path">
    <h2>《{{ courseTitle }}》章节列表</h2>
    <ul>
      <li v-for="chapter in chapters" :key="chapter.id">
        <router-link :to="`/exam/${courseId}/${chapter.id}`" @click="navigateToChapter(chapter.id)">{{ chapter.title }}</router-link>
      </li>
    </ul>
    <button @click="goBack">返回课程列表</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Chapter {
  id: string;
  title: string;
}

const route = useRoute()
const router = useRouter()
const courseId = computed(() => route.params.courseId as string)
const courseTitle = ref('')
const chapters = ref<Chapter[]>([])

// 加载章节数据的函数
const loadChaptersData = (id: string) => {
  // 重置数据，显示加载状态
  courseTitle.value = ''
  chapters.value = []
  
  // 模拟API调用
  setTimeout(() => {
    // 假数据
    courseTitle.value = id === '1' ? 'JavaScript基础' : id === '2' ? 'Vue.js进阶' : 'React入门'
    
    // 生成随机章节
    chapters.value = Array(3).fill(null).map((_, index) => ({
      id: `${index + 1}`,
      title: `第${index + 1}章: ${['基础概念', '核心特性', '高级技巧'][index]}`,
      description: `这是关于${courseTitle.value}的第${index + 1}章内容`
    }))
  }, 500)
}

// 初始加载
onMounted(() => {
  loadChaptersData(courseId.value)
})

// 监听路由参数变化
watch(
  courseId,
  (newId) => {
    loadChaptersData(newId)
  },
  { immediate: true }
)

// 导航到章节详情
const navigateToChapter = (chapterId: string) => {
  router.push(`/exam/${courseId.value}/${chapterId}`)
}

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