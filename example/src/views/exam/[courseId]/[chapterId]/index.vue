<template>
  <div class="exam-detail" :key="route.path">
    <h2>考试详情</h2>
    <div class="info">
      <p><strong>课程:</strong> {{ courseTitle }}</p>
      <p><strong>章节:</strong> {{ chapterTitle }}</p>
      <div class="exam-info">
        <h3>考试内容</h3>
        <p>这是 {{ courseTitle }} 的 {{ chapterTitle }} 章节的考试内容。</p>
        <p>您正在查看的路由参数为：</p>
        <ul>
          <li><strong>课程ID:</strong> {{ courseId }}</li>
          <li><strong>章节ID:</strong> {{ chapterId }}</li>
        </ul>
      </div>
    </div>
    <div class="actions">
      <button @click="goBack">返回《{{ courseTitle }}》章节列表</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const courseId = computed(() => route.params.courseId as string)
const chapterId = computed(() => route.params.chapterId as string)
const courseTitle = ref('')
const chapterTitle = ref('')
const questions = ref([])

// 加载考试数据的函数
const loadExamData = (cId: string, chId: string) => {
  // 重置数据，显示加载状态
  courseTitle.value = ''
  chapterTitle.value = ''
  questions.value = []
  
  // 模拟API调用
  setTimeout(() => {
    // 假数据
    courseTitle.value = cId === '1' ? 'JavaScript基础' : cId === '2' ? 'Vue.js进阶' : 'React入门'
    chapterTitle.value = chId === '1' ? '变量与类型' : chId === '2' ? '函数与作用域' : '对象与原型'
    
    // 生成随机题目
    questions.value = Array(5).fill(null).map((_, index) => ({
      id: `q-${index + 1}`,
      text: `问题 ${index + 1}: 关于${chapterTitle.value}的概念，下列说法正确的是？`,
      options: ['选项A', '选项B', '选项C', '选项D']
    }))
  }, 500)
}

// 初始加载
onMounted(() => {
  loadExamData(courseId.value, chapterId.value)
})

// 监听路由参数变化
watch(
  [courseId, chapterId],
  ([newCourseId, newChapterId]) => {
    loadExamData(newCourseId, newChapterId)
  },
  { immediate: true }
)

// 返回章节列表
const goBack = () => {
  router.push(`/exam/${courseId.value}`)
}
</script>

<style scoped>
.exam-detail {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

h2 {
  margin-bottom: 20px;
}

.info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.exam-info {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

h3 {
  margin-bottom: 15px;
}

ul {
  list-style-type: none;
  padding: 0;
  margin-top: 10px;
}

li {
  margin-bottom: 8px;
}

.actions {
  margin-top: 20px;
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