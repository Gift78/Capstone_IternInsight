<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios';
import viewIcon from '@/assets/view.png'
import hideIcon from '@/assets/hide.png'


const name = ref('');
const username = ref('');
const email = ref('');
const password = ref('');
const phone = ref('');
const position = ref('');
const description = ref('');
const errorMessage = ref('');
const showErrorModal = ref(false);
const router = useRouter();

const showPassword = ref(false);


const registerUser = async () => {
  try {
    const payload = {
      name: name.value,
      username: username.value,
      email: email.value,
      password: password.value,
      phone: phone.value,
      position: position.value,
      description: description.value,
      image: 'default.jpg'
    };

    console.log('Sending:', payload);
    await axios.post('http://localhost:3000/register', payload);
    router.push('/login');

  } catch (error: unknown) {
  const e = error as { response?: { data?: { message?: string } } };
  if (e.response?.data?.message) {
    errorMessage.value = e.response.data.message;
  } else {
    errorMessage.value = 'Registration failed.';
  }
  showErrorModal.value = true;
}
};



</script>

<template>
  <div class="register-page flex h-screen">
    <!-- ✅ ฝั่งซ้าย: fixed ไม่ขยับ -->
    <div class="w-1/2 fixed left-0 inset-y-0 overflow-clip border-b border-transparent">
      <img src="@/assets/login-bg.jpg" alt="Login Background" class="w-full min-h-full object-cover object-top" />
      <div class="absolute inset-0 bg-black bg-opacity-40"></div>
      <div class="absolute inset-0 flex flex-col justify-center items-center text-white px-8">
        <h1 class="text-9xl font-extrabold leading-none text-center">ITern<br />Insight</h1>
        <p class="text-3xl font-bold mt-4 text-center">Online Community For</p>
        <p class="text-3xl font-light mt-4 text-center">School of Information Technology,<br />KMUTT</p>
      </div>
    </div>

    <!-- ✅ ฝั่งขวา: scroll ได้ และหลีก fixed -->
    <div class="ml-auto w-1/2">
      <div class="min-h-screen flex flex-col items-center justify-start px-10 pt-2 pb-20 scroll-pb-20 overflow-y-auto">
        <h2 class="text-2xl md:text-3xl font-semibold text-center mb-8">Create your account</h2>
        <form @submit.prevent="registerUser" class="w-full max-w-sm space-y-2">

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name <span
                class="text-red-500">*</span></label>
            <input v-model="name" type="text" placeholder="e.g. John Doe" required
              class="w-full border px-4 py-2 rounded text-sm placeholder-gray-300" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username <span
                class="text-red-500">*</span></label>
            <input v-model="username" type="text" placeholder="e.g. johndoe123" required
              class="w-full border px-4 py-2 rounded text-sm placeholder-gray-300" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email <span
                class="text-red-500">*</span></label>
            <input v-model="email" type="email" placeholder="e.g. john@example.com" required
              class="w-full border px-4 py-2 rounded text-sm placeholder-gray-300" />
          </div>

          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Password <span class="text-red-500">*</span>
            </label>

            <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Enter a strong password"
              required class="w-full border px-4 py-2 rounded text-sm placeholder-gray-300 pr-10" />

            <button type="button" @click="showPassword = !showPassword"
              class="absolute right-3 top-9 focus:outline-none">
              <img :src="showPassword ? hideIcon : viewIcon" class="w-5 h-5" alt="toggle password visibility" />
            </button>
          </div>



          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone <span
                class="text-red-500"></span></label>
            <input v-model="phone" type="text" placeholder="e.g. 0812345678" maxlength="10"
              @input="phone = phone.slice(0, 10)"
              class="w-full border px-4 py-2 rounded text-sm placeholder-gray-300" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Position <span
                class="text-red-500"></span></label>
            <input v-model="position" type="text" placeholder="e.g. Developer, Student"
              class="w-full border px-4 py-2 rounded text-sm placeholder-gray-300" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description <span
                class="text-red-500"></span></label>
            <textarea v-model="description" placeholder="about yourself"
              class="w-full border px-4 py-2 rounded text-sm placeholder-gray-300"></textarea>
          </div>

          <router-link to="/login" class="text-sm text-teal-600 hover:underline">Back to Login</router-link>

          <button type="submit"
            class="w-full bg-gradient-to-b from-button to-button/50 text-white px-4 py-2 rounded-lg shadow-sm">
            REGISTER
          </button>
        </form>


      </div>
    </div>

    <div v-if="showErrorModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded shadow-md w-96 relative">
        <h2 class="text-lg font-semibold text-red-600 text-center mb-2">Registration Error</h2>
        <p class="text-gray-800 text-center mb-4">{{ errorMessage }}</p>

        <!-- ปุ่ม Close อยู่ชิดขวา -->
        <div class="flex justify-end">
          <button @click="showErrorModal = false" class="bg-red-500 text-white px-2 py- rounded hover:bg-red-600">
            Close
          </button>
        </div>
      </div>
    </div>



  </div>

</template>


<style scoped></style>
