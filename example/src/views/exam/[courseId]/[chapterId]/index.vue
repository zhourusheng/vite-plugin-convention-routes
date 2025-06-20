<template>
  <div class="exam-detail">
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
      <button @click="goBack">返回章节列表</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const courseId = computed(() => route.params.courseId as string)
const chapterId = computed(() => route.params.chapterId as string)
const courseTitle = ref('')
const chapterTitle = ref('')

// 模拟获取课程和章节数据
onMounted(() => {
  // 根据路由参数获取课程和章节信息
  const cId = courseId.value
  const chId = chapterId.value
  
  // 设置课程标题
  if (cId === '1') {
    courseTitle.value = '前端开发课程'
    if (chId === '101') chapterTitle.value = 'HTML基础'
    else if (chId === '102') chapterTitle.value = 'CSS进阶'
    else if (chId === '103') chapterTitle.value = 'JavaScript核心'
    else chapterTitle.value = '未知章节'
  } 
  else if (cId === '2') {
    courseTitle.value = '后端开发课程'
    if (chId === '201') chapterTitle.value = 'Node.js基础'
    else if (chId === '202') chapterTitle.value = '数据库设计'
    else if (chId === '203') chapterTitle.value = 'API开发'
    else chapterTitle.value = '未知章节'
  }
  else if (cId === '3') {
    courseTitle.value = '移动开发课程'
    if (chId === '301') chapterTitle.value = 'React Native入门'
    else if (chId === '302') chapterTitle.value = 'Flutter开发'
    else if (chId === '303') chapterTitle.value = '混合应用开发'
    else chapterTitle.value = '未知章节'
  }
  else {
    courseTitle.value = '未知课程'
    chapterTitle.value = '未知章节'
  }
})

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