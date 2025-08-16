
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import router from '@/router'

interface Company {
  id: number
  companyName: string
  description: string
  phone: string
}

interface Post {
  id: number
  title: string
  description: string
  position: string[]
  startDate: string | null
  endDate: string
  company: Company
  email: string
  tel: string
}

const post = ref<Post | null>(null)
const isLoading = ref(true)
const route = useRoute()
const postId = route.params.id

const showModal = ref(false)
const postIdToDelete = ref<number | null>(null)

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized: No token found')

    const response = await axios.get(`http://localhost:3000/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    post.value = response.data
  } catch (error: unknown) {
  if (axios.isAxiosError(error)) {
    console.error('Error fetching post details:', error.response?.data || error.message);
  } else {
    console.error('Unexpected error:', error);
  }
} finally {
  isLoading.value = false;
}
}

const deleteAnnouncement = async (id: number) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Unauthorized: No token found')

    await axios.delete(`http://localhost:3000/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    router.push('/admin/annouce')
  } catch (error: unknown) {
  if (axios.isAxiosError(error)) {
    console.error('Error deleting announcement:', error.response?.data || error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
}

const confirmDelete = (id: number) => {
  postIdToDelete.value = id
  showModal.value = true
}

const handleDelete = () => {
  if (postIdToDelete.value !== null) {
    deleteAnnouncement(postIdToDelete.value)
    showModal.value = false
  }
}

const cancelDelete = () => {
  showModal.value = false
}

const formatDate = (date: string | null): string => {
  if (!date) return ''
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return ''
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'Asia/Bangkok',
  }
  return new Intl.DateTimeFormat('en-GB', options).format(parsed).toUpperCase()
}

onMounted(fetchData)
</script>

<template>
  <div class="font-Prompt flex flex-col w-full space-y-2 p-2 sm:px-12 md:px-16 lg:px-32 lg:py-4 xl:px-56 2xl:px-96">
    <div v-if="isLoading" class="text-center">Loading...</div>

    <div v-else-if="post" class="flex flex-col border border-border rounded-lg p-6 gap-2">
      <div class="flex flex-row gap-x-4 items-center">
        <div class="w-[40px] h-[40px] bg-gray-600 rounded-full"></div>
        <h1 class="text-lg font-bold">{{ post.title }}</h1>
        <div class="ml-auto flex flex-row gap-4">
          <RouterLink :to="`/admin/edit-annouce/${post.id}`">
            <i class="fas fa-pen"></i>
          </RouterLink>
          <button @click="confirmDelete(post.id)">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>

      <div class="flex flex-row items-center w-fit gap-4 text-base font-bold">
        Position Available:
        <div class="border border-border w-fit p-2 rounded-lg">
          <div v-for="(position, index) in post.position" :key="index">
            <span>{{ position }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-row gap-2">
        <span class="text-sm font-bold">{{ formatDate(post.startDate) }}</span>
        <span v-if="post.startDate != null" class="text-sm"> - </span>
        <span v-if="post.startDate == null" class="text-sm"> DeadLine: </span>
        <span class="text-sm font-bold">{{ formatDate(post.endDate) }}</span>
      </div>

      <span class="text-sm">{{ post.description }}</span>
      <p>Email: {{ post.email }}</p>
      <p>Tel: {{ post.tel }}</p>
    </div>

    <div v-else class="text-center">Post not found</div>
  </div>

  <div v-if="showModal" class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
    <div class="bg-white p-6 rounded-lg w-80">
      <h3 class="text-lg font-bold mb-4">
        Are you sure you want to delete this post
        <span class="text-red-500 font-bold">[{{ post?.title }}]</span>?
      </h3>
      <div class="flex justify-between gap-4">
        <button @click="handleDelete" class="w-full bg-red-600 text-white py-2 rounded-md">Confirm</button>
        <button @click="cancelDelete" class="w-full bg-gray-400 text-white py-2 rounded-md">Cancel</button>
      </div>
    </div>
  </div>
</template>
