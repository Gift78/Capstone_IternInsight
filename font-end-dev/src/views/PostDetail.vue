<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

interface Company {
  id: number;
  companyName: string;
  description: string;
  phone: string;
}

interface Post {
  id: number
  title: string
  description: string
  position: string[]  // แก้ให้เป็น array เพราะใน template ใช้ v-for
  startDate: Date | null
  endDate: Date
  company: Company
}

const post = ref<Post | null>(null)
const isLoading = ref(true)
const route = useRoute()
const postId = route.params.id

const fetchData = async () => {
  try {
    console.log('postId:', postId)
    // ระบุ full URL หรือ baseURL ของ axios ให้ถูกต้อง
    const response = await axios.get(`http://localhost:3000/posts/${postId}`);
    const postData = response.data;

    if (!postData) {
      throw new Error("No post data found");
    }

    if (!postData.company) {
      throw new Error("No company data found in post");
    }

    post.value = {
      id: postData.id,
      title: postData.title,
      description: postData.description,
      // เช็คว่า postData.position เป็น array หรือไม่ ถ้าไม่ใช่ แปลงเป็น array
      position: Array.isArray(postData.position) ? postData.position : [postData.position],
      startDate: postData.startDate ? new Date(postData.startDate) : null,
      endDate: new Date(postData.endDate),
      company: {
        id: postData.company.id,
        companyName: postData.company.companyName,
        description: postData.company.description,
        phone: postData.company.phone
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData)

const formatDate = (date: Date | null): string => {
  if (date === null) {
    return "";
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'Asia/Bangkok',
  }

  return new Intl.DateTimeFormat('en-GB', options).format(date).toUpperCase()
}
</script>

<template>
  <div class="flex flex-col w-full space-y-2 p-2 sm:px-12 md:px-16 lg:px-32 lg:py-4 xl:px-56 2xl:px-96">
    <div v-if="isLoading" class="text-center">Loading...</div>
    <div v-else-if="post" class="flex flex-col border border-border rounded-lg p-6 gap-2">
      <div class="flex flex-row gap-x-4 items-center">
        <div class="w-[40px] h-[40px] bg-gray-600 rounded-full"></div>
        <h1 class="text-lg font-bold font-Prompt">{{ post.title }}</h1>
      </div>
      <div class="flex flex-row items-center w-fit gap-4 text-base font-bold font-Prompt">
        Position Available:
        <div class="border border-border w-fit p-2 rounded-lg">
          <div v-for="(position, index) in post.position" :key="index">
            <span>{{ position }}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-row gap-2">
        <span class="text-sm font-Prompt">{{ formatDate(post.startDate) }}</span>
        <span v-if="post.startDate != null" class="text-sm font-Prompt"> - </span>
        <span v-if="post.startDate == null" class="text-sm font-Prompt"> DeadLine: </span>
        <span class="text-sm font-Prompt">{{ formatDate(post.endDate) }}</span>
      </div>
      <span class="text-xs font-Prompt">{{ post.description }}</span>
    </div>
    <div v-else class="text-center">Post not found</div>
  </div>
</template>
