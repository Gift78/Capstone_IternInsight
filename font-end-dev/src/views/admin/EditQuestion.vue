<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

// ดึงค่าพารามิเตอร์และ query
const questionId = route.params.id
const from = route.query.from // 'admin' หรือ 'user'


// ฟอร์มข้อมูล
const title = ref('')
const description = ref('')
const date = ref('')

// error
const errorMessages = ref<string[]>([])
const showError = ref(false)

// profanity filter
const profanityPattern = /(อี)?(เหี้ย|ดอก|ห่า|สัส|เวร|ควาย|สัด|ควย)/gi
const removeRepeatedCharacters = (text: string) => text.replace(/([ก-๙])\1+/g, '$1')
const containsProfanity = (text: string) => profanityPattern.test(removeRepeatedCharacters(text))

const handleInput = (event: Event) => {
  const input = event.target as HTMLInputElement | HTMLTextAreaElement
  const cleaned = removeRepeatedCharacters(input.value)
  if (containsProfanity(cleaned)) {
    input.value = cleaned.replace(profanityPattern, "")
    input.setCustomValidity("กรุณาใช้คำที่สุภาพ")
    input.reportValidity()
  } else {
    input.setCustomValidity("")
    input.reportValidity()
  }
}

// ดึงข้อมูลคำถามเดิม
const fetchQuestion = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await axios.get(`http://localhost:3000/questions/${questionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const q = res.data
    title.value = q.title
    description.value = q.description
    date.value = q.date.split('T')[0] // ตัดเวลาทิ้ง
  } catch (error) {
    console.error('Error loading question:', error)
  }
}

onMounted(fetchQuestion)

const validateForm = () => {
  errorMessages.value = []
  if (!title.value.trim()) errorMessages.value.push('Title is required.')
  if (!description.value.trim()) errorMessages.value.push('Description is required.')
  if (containsProfanity(title.value)) errorMessages.value.push('Title contains inappropriate language.')
  if (containsProfanity(description.value)) errorMessages.value.push('Description contains inappropriate language.')
  showError.value = errorMessages.value.length > 0
  return errorMessages.value.length === 0
}

// ส่งข้อมูลไป backend
const submitForm = async () => {
  if (!validateForm()) return

  const token = localStorage.getItem('token')
  if (!token) {
    alert('Session expired')
    return
  }

  const payload = JSON.parse(atob(token.split('.')[1]))
  console.log('Editing by userId:', payload.sub, 'role:', payload.role)

  try {
    await axios.put(`http://localhost:3000/questions/${questionId}`, {
      title: title.value,
      description: description.value,
      date: date.value,
      userId: payload.sub  // ต้องส่ง userId ไปด้วย (หลังบ้านคุณน่าจะใช้ userId ยืนยัน)
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })

    redirectBack()
  } catch (error) {
    console.error('Update failed:', error)
    errorMessages.value = ['Failed to update question']
    showError.value = true
  }
}

// ย้อนกลับไปหน้าเดิม
const redirectBack = () => {
  if (from === 'admin') {
    router.push('/admin/question')
  } else {
    router.push('/questions')
  }
}

const saveAndRedirect = async () => {
  try {
    await submitForm();
    redirectBack();
  } catch (error) {
    console.error('Error saving:', error);
  }
};

const closeErrorPopup = () => showError.value = false
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 font-Prompt">
    <h1 class="text-center text-2xl font-bold mb-6 text-hightlight">Edit Question</h1>

    <form @submit.prevent="submitForm">
      <div class="mb-4">
        <label class="block font-semibold mb-1">Title <span class="text-red-500">*</span></label>
        <input type="text" v-model="title" @input="handleInput" class="w-full border rounded-lg px-3 py-2" required />
      </div>

      <div class="mb-4">
        <label>Description <span class="text-red-500">*</span></label>
        <textarea
          v-model="description"
          @input="handleInput"
          class="w-full border rounded-lg px-3 py-2"
          rows="5"
          required
        ></textarea>
      </div>

      <div class="mb-4">
        <label>Date <span class="text-red-500">*</span></label>
        <input type="date" v-model="date" class="w-full border rounded-lg px-3 py-2" required />
      </div>

      <div class="flex justify-center space-x-4 mt-4">
        <button
          type="submit"
          @click="saveAndRedirect"
          class="text-white text-xs font-bold bg-gradient-to-b from-button px-4 py-1.5 h-fit to-button/55 shadow-md rounded-lg lg:text-sm"
        >
          Save
        </button>
        <button
          type="button"
          @click="redirectBack"
          class="text-white text-xs font-bold bg-gray-500 px-4 py-1.5 h-fit shadow-md rounded-lg lg:text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>

  <!-- Error popup -->
  <div
    v-if="showError"
    class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
  >
    <div class="bg-white p-6 rounded-lg w-80">
      <h3 class="text-lg font-bold mb-4">Validation Error</h3>
      <ul class="mb-4 text-sm text-red-600">
        <li v-for="(msg, index) in errorMessages" :key="index">{{ msg }}</li>
      </ul>
      <button @click="closeErrorPopup" class="w-full bg-red-600 text-white py-2 rounded-md">
        OK
      </button>
    </div>
  </div>
</template>
