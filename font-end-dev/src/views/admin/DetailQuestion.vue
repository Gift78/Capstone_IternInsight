<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'


// Define types
interface User {
  id?: number
  name?: string
  role?: string
}

interface Comment {
  id: number
  user: User
  text: string
  date: string
}

interface Question {
  id: number
  title: string
  description: string
  created_at: string
  updated_at: string
  like: unknown[]
  date: string
}

// Define refs
const question = ref<Question | null>(null)
const comments = ref<Comment[]>([])
const commentText = ref('')
const showModal = ref(false)
const deleteId = ref<number | null>(null)
const deleteTitle = ref('')
const editCommentId = ref<number | null>(null)
const editText = ref('')
const deleteCommentId = ref<number | null>(null)
const showCommentDelete = ref(false)
const route = useRoute()
const router = useRouter()

const id = ref<number>(Number(route.params.id))
const from = route.query.from || 'user'

const likeCount = computed(() => question.value?.like?.length || 0)

// User info from localStorage
const user = ref<User | null>(null)
const storedUser = localStorage.getItem('user')
if (storedUser) {
  try {
    user.value = JSON.parse(storedUser)
    if (user.value) {
      user.value.name = 'Admin' // Update user name
      localStorage.setItem('user', JSON.stringify(user.value)) // Update in localStorage
    }
  } catch (error) {
    console.error('Error parsing user data from localStorage', error)
  }
}

// Fetch question data
const fetchQuestion = async () => {
  const token = localStorage.getItem('token')
  if (token) {
    const response = await axios.get(`http://localhost:3000/questions/${id.value}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    question.value = response.data
  }
}

// Fetch comments data
const fetchComments = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/questions/${id.value}/comment`)
    comments.value = Array.isArray(res.data.comments) ? res.data.comments.reverse() : []
  } catch (err) {
    console.error('Error fetching comments:', err)
  }
}

// Submit new comment
const submitComment = async () => {
  if (!user.value?.id) {
    console.error('User is not logged in or does not have an ID')
    return
  }

  const token = localStorage.getItem('token')
  if (token) {
    const now = new Date()

    const res = await axios.post(`http://localhost:3000/questions/${id.value}/comment`, {
      text: commentText.value,
      date: now,
      user: user.value.id,
      question: id.value,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.status === 201 || res.status === 200) {
      commentText.value = ''
      await fetchComments()
    }
  }
}

// Edit comment functionality
const startEditComment = (comment: Comment) => {
  editCommentId.value = comment.id
  editText.value = comment.text
}

// Cancel editing comment
const cancelEditComment = () => {
  editCommentId.value = null
  editText.value = ''
}

// Save edited comment
const saveCommentEdit = async () => {
  const token = localStorage.getItem('token')
  if (token && editCommentId.value !== null) {
    await axios.put(`http://localhost:3000/questions/${id.value}/comment/${editCommentId.value}`, {
      text: editText.value,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    })

    cancelEditComment()
    await fetchComments()
  }
}

// Confirm delete comment
const confirmDeleteComment = (id: number) => {
  if (user.value?.id) {
    deleteCommentId.value = id
    showCommentDelete.value = true
  } else {
    console.error('User is not logged in or does not have an ID')
  }
}

// Delete comment
const deleteComment = async () => {
  const token = localStorage.getItem('token')
  if (token && deleteCommentId.value !== null) {
    await axios.delete(`http://localhost:3000/questions/${id.value}/comment/${deleteCommentId.value}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    showCommentDelete.value = false
    await fetchComments()
  }
}

// Cancel delete comment
const cancelDeleteComment = () => {
  showCommentDelete.value = false
}

// Confirm delete question
const confirmDelete = (id: number, title: string) => {
  deleteId.value = id
  deleteTitle.value = title
  showModal.value = true
}

// Delete Question
const handleDeleteQuestion = async () => {
  if (user.value?.id) {
    const token = localStorage.getItem('token')
    if (token && deleteId.value !== null) {
      await axios.delete(`http://localhost:3000/questions/${deleteId.value}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      showModal.value = false
      if (user.value.role === 'admin') {
        router.push('/admin/question')
      } else {
        router.push('/questions')
      }
    }
  } else {
    console.error('User is not logged in')
  }
}

// Cancel delete Question
const cancelDeleteQuestion = () => {
  showModal.value = false
}

// ฟังก์ชัน formatDateTime
const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleString()
}

// ฟังก์ชันสำหรับฟอร์แมตวันที่
const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleString()
}

onMounted(() => {
  fetchQuestion()
  fetchComments()
})
</script>

<template>
  <div class="font-Prompt flex flex-col w-full space-y-2 p-2 sm:px-12 md:px-16 lg:px-32 lg:py-4 xl:px-56 2xl:px-96">
    <!-- Header -->
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-left text-2xl font-bold text-hightlight">Question</h1>
      <div class="text-sm text-gray-500 whitespace-nowrap">
        {{ likeCount }} Like {{ comments.length }} Comments
      </div>
    </div>

    <!-- Question Details -->
    <div v-if="question" class="flex flex-col border border-border rounded-lg p-6 gap-2 bg-white shadow-lg">
      <div class="mb-4">
        <h2 class="text-2xl font-extrabold">{{ question.title || 'No title available' }}</h2>
      </div>
      <p v-if="question.description" class="text-md leading-relaxed text-gray-700 mb-4">{{ question.description }}</p>
      <p class="text-sm text-gray-500">Date: {{ formatDate(question.date) }}</p>
      <p v-if="question.created_at" class="text-sm text-gray-500">Created at: {{ formatDateTime(question.created_at) }}</p>
      <p v-if="question.updated_at" class="text-sm text-gray-500">Updated at: {{ formatDateTime(question.updated_at) }}</p>

      <!-- Admin Control -->
      <div class="flex gap-4 justify-end items-center">
        <router-link :to="{ path: from === 'admin' ? '/admin/edit-question/' + question.id : '/edit-question/' + question.id, query: { from } }" class="text-hightlight hover:underline">
          <i class="fas fa-edit"></i>
        </router-link>
        <button @click="confirmDelete(question.id, question.title)" class="text-hightlight hover:underline">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <div v-else class="text-center text-red-500 text-lg">Question not found.</div>

    <!-- Comment Section -->
    <h3 class="text-2xl font-semibold mb-2 text-hightlight">Comment</h3>

    <!-- Comment Form -->
    <form @submit.prevent="submitComment" class="bg-white shadow rounded-lg p-4 mt-4 border border-gray-300">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold uppercase text-xl">
          {{ user?.name?.charAt(0) || '?' }}
        </div>
        <div>
          <strong class="text-xl">{{ user?.name || 'Unknown' }}</strong>
        </div>
      </div>
      <div class="flex items-center border rounded-xl bg-gray-100 p-2 pr-3 ml-12">
        <textarea v-model="commentText" placeholder="Comment ..." class="flex-1 bg-transparent outline-none px-3 resize-none" rows="1"></textarea>
        <button type="submit" :disabled="!commentText.trim()">
          <svg :class="['w-5 h-5', commentText.trim() ? 'text-blue-600' : 'text-gray-400']" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.4 20.4l17.3-8.7c.5-.2.5-.9 0-1.1L3.4 2c-.5-.2-1 .2-1 .8v6.3c0 .3.2.5.5.6l11.2 2.3L2.9 14.4c-.3.1-.5.3-.5.6v6.2c0 .6.5 1 1 0.8z" />
          </svg>
        </button>
      </div>
    </form>

    <!-- Comment List -->
    <div v-for="cmt in comments" :key="cmt.id" class="mb-4 border rounded-lg p-4">
      <div class="flex justify-between items-start mb-1">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold uppercase">
            {{ cmt.user?.name?.charAt(0) || '?' }}
          </div>
          <div>
            <strong class="text-xl">{{ cmt.user?.name || 'Unknown' }}</strong>
            <div class="text-sm text-gray-400">{{ formatDate(cmt.date) }}</div>
          </div>
        </div>
        <div v-if="user && user.id && (user.role === 'admin' || user.id === cmt.user?.id)" class="flex gap-2 text-sm text-hightlight">
          <button @click="startEditComment(cmt)"><i class="fas fa-pen"></i></button>
          <button @click="confirmDeleteComment(cmt.id)"><i class="fas fa-trash"></i></button>
        </div>
      </div>

      <div v-if="editCommentId === cmt.id">
        <textarea v-model="editText" class="w-full border rounded-lg p-2" rows="3"></textarea>
        <div class="mt-2 flex gap-2">
          <button @click="saveCommentEdit" class="text-hightlight">Save</button>
          <button @click="cancelEditComment" class="text-gray-500">Cancel</button>
        </div>
      </div>

      <div v-else>
        <p class="text-md text-gray-700">{{ cmt.text }}</p>
      </div>
    </div>
  </div>

  <!-- Confirm Delete Modal -->
  <div v-if="showModal" class="fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h3 class="text-xl font-semibold">Are you sure you want to delete this question?</h3>
      <p class="text-sm text-gray-500 mt-2">{{ deleteTitle }}</p>
      <div class="mt-4 flex justify-between gap-4">
        <button @click="handleDeleteQuestion" class="px-4 py-2 bg-red-500 text-white rounded-lg">Delete</button>
        <button @click="cancelDeleteQuestion" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg">Cancel</button>
      </div>
    </div>
  </div>

  <!-- Confirm Delete Comment Modal -->
  <div v-if="showCommentDelete" class="fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h3 class="text-xl font-semibold">Are you sure you want to delete this comment?</h3>
      <div class="mt-4 flex justify-between gap-4">
        <button @click="deleteComment" class="px-4 py-2 bg-red-500 text-white rounded-lg">Delete</button>
        <button @click="cancelDeleteComment" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg">Cancel</button>
      </div>
    </div>
  </div>
</template>
