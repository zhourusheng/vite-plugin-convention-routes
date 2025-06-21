<template>
  <div class="exam-container">
    <h2>考试课程列表</h2>
    <div class="course-list">
      <div v-for="course in courses" :key="course.id" class="course-card">
        <h3>{{ course.name }}</h3>
        <p>{{ course.description }}</p>
        <router-link :to="`/exam/${course.id}`" class="view-btn" @click="logNavigation(course.id)">查看章节</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 示例数据
const courses = ref([
  { 
    id: '1', 
    name: '前端开发课程', 
    description: '学习HTML、CSS和JavaScript等前端技术，构建现代化的Web应用程序。' 
  },
  { 
    id: '2', 
    name: '后端开发课程', 
    description: '掌握服务器端编程、数据库设计和API开发，构建强大的应用后端。' 
  },
  { 
    id: '3', 
    name: '移动开发课程', 
    description: '学习React Native和Flutter等技术，开发跨平台移动应用。' 
  }
])

// 记录导航日志
const logNavigation = (courseId: string) => {
  console.log(`导航到课程章节列表: /exam/${courseId}`)
}
</script>

<style scoped>
.exam-container {
  max-width: 100%;
  padding: 0;
}

h2 {
  margin-bottom: 30px;
  color: #333;
  text-align: center;
  font-size: 1.8rem;
}

.course-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.course-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.course-card h3 {
  color: #0066cc;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.4rem;
}

.course-card p {
  flex-grow: 1;
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
}

.view-btn {
  display: inline-block;
  background-color: #0066cc;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  text-align: center;
  font-weight: 500;
  transition: background-color 0.3s;
}

.view-btn:hover {
  background-color: #0055aa;
}
</style> 