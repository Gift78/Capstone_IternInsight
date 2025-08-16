<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import viewIcon from '@/assets/view.png'
import hideIcon from '@/assets/hide.png'
import type { AxiosError } from 'axios'

const email = ref('')
const verifyCode = ref('')
const newPassword = ref('')
const showForm = ref(false)
const showPassword = ref(false)
const message = ref('')
const loading = ref(false)


const modalMessage = ref('')
const showModal = ref(false)

const isSuccess = ref(false) // ถ้า true = success, ถ้า false = error


const sendVerifyCode = async () => {
  try {
    loading.value = true
    const response = await axios.post('http://localhost:3000/login/send-verify-email', { email: email.value })
    message.value = response.data.message || 'Verification code sent.'
    showForm.value = true
  } catch (error: unknown) {
    const err = error as AxiosError<{ message: string }>
    modalMessage.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
    isSuccess.value = false
    showModal.value = true
  } finally {
    loading.value = false
  }
}

const resetPassword = async () => {
  try {
    loading.value = true
    const response = await axios.post('http://localhost:3000/login/reset-password', {
      email: email.value,
      verifyCode: verifyCode.value,
      newPassword: newPassword.value,
    })
    // ✅ แสดง modal เมื่อสำเร็จ
    modalMessage.value = response.data.message || 'รีเซ็ตรหัสผ่านสำเร็จแล้ว'
    isSuccess.value = true
    showModal.value = true
  } catch (error: unknown) {
    const err = error as AxiosError<{ message: string }>
    modalMessage.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
    isSuccess.value = false
    showModal.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page flex h-screen">
    <!-- ✅ ฝั่งซ้าย: ห้ามแก้ -->
    <div class="w-1/2 fixed left-0 inset-y-0 overflow-clip border-b border-transparent">
      <img src="@/assets/login-bg.jpg" alt="Login Background" class="w-full min-h-full object-cover object-top" />
      <div class="absolute inset-0 bg-black bg-opacity-40"></div>
      <div class="absolute inset-0 flex flex-col justify-center items-center text-white px-8">
        <h1 class="text-9xl font-extrabold leading-none text-center">ITern<br />Insight</h1>
        <p class="text-3xl font-bold mt-4 text-center">Online Community For</p>
        <p class="text-3xl font-light mt-4 text-center">School of Information Technology,<br />KMUTT</p>
      </div>
    </div>

    <!-- ✅ ฝั่งขวา: แบบฟอร์มลืมรหัสผ่าน -->
    <div class="ml-auto w-1/2">
      <div class="min-h-screen flex flex-col items-center justify-center px-10 pt-10">
        <h2 class="text-2xl md:text-3xl font-semibold text-center mb-6">Forgot your password?</h2>

        <div class="w-full max-w-sm space-y-4">
          <div>
            <label class="block font-medium text-sm mb-1">Email<span class="text-red-500">*</span></label>
            <input v-model="email" type="email" required placeholder="e.g. user@example.com"
              class="w-full border px-4 py-2 rounded text-sm placeholder-gray-300" />
            <button @click="sendVerifyCode"
              class="mt-2 w-full  text-white py-2 rounded w-full bg-gradient-to-b from-button to-button/50 text-white px-4 py-2 rounded-lg shadow-sm"
              :disabled="loading">
              Send verify code
            </button>

          </div>

          <div v-if="showForm" class="space-y-4">
            <div>
              <label class="block font-medium text-sm mb-1">Verify Code<span class="text-red-500">*</span></label>
              <input v-model="verifyCode" type="text" placeholder="e.g. 123456"
                class="w-full border px-4 py-2 rounded text-sm placeholder-gray-300" />
            </div>

            <div class="relative">
              <label class="block font-medium text-sm mb-1">New Password<span class="text-red-500">*</span></label>
              <input v-model="newPassword" :type="showPassword ? 'text' : 'password'" placeholder="Enter new password"
                class="w-full border px-4 py-2 rounded text-sm placeholder-gray-300 pr-10" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3 top-9 focus:outline-none">
                <img :src="showPassword ? hideIcon : viewIcon" class="w-5 h-5" alt="toggle password visibility" />
              </button>
            </div>

            <button @click="resetPassword"
              class="mt-2 w-full  text-white py-2 rounded w-full bg-gradient-to-b from-button to-button/50 text-white px-4 py-2 rounded-lg shadow-sm"
              :disabled="loading">
              Reset
            </button>
          </div>
          <router-link to="/login" class="text-sm text-teal-600 hover:underline">Back to Login</router-link>


          <!-- <div v-if="message" class="text-green-600 text-sm text-center">{{ message }}</div>
                    <div v-if="errorMessage" class="text-red-600 text-sm text-center">{{ errorMessage }}</div> -->
        </div>
      </div>
    </div>

    <!-- ✅ Modal เดียวใช้ได้ทั้ง Success และ Error -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded shadow-md w-96 flex flex-col relative">

        <!-- ปุ่มกากบาท (×) มุมขวาบน -->
        <button @click="showModal = false"
          class="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold" aria-label="Close">
          ✕
        </button>


        <!-- หัวข้อ -->
        <h2 class="text-2xl font-bold mb-2 flex items-center justify-center"
          :class="isSuccess ? 'text-green-600' : 'text-red-600'">
          {{ isSuccess ? 'Success' : 'Error' }}
        </h2>

        <!-- ข้อความ -->
        <div class="flex-grow flex items-center justify-center mb-4 text-xl">
          <p class="text-gray-800 text-center">{{ modalMessage }}</p>
        </div>
      </div>
    </div>


  </div>

</template>

<style scoped></style>
