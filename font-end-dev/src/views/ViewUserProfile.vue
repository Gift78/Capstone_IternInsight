<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()

interface User {
  id: number;
  email: string;
  password: string;
  username: string;
  name: string;
  phone: string;
  position: string;
  description: string;
  image: string;
}
const user = ref<User | null>(null);

onMounted(async () => {
  const userId = route.params.id
  try {
    const res = await axios.get(`http://localhost:3000/users/${userId}`)
    user.value = res.data
  } catch (err) {
    console.error('Error fetching user:', err)
  }
})

const isValidImage = (img?: string): boolean => {
  const trimmed = img?.trim().toLowerCase();
  return !!(trimmed && trimmed !== 'null' && trimmed !== 'undefined' && trimmed !== 'default.jpg');
};

const imageUrl = computed(() => {
  if (!user.value || !isValidImage(user.value.image)) return null;

  const image = user.value.image;
  return image.startsWith('http')
    ? image
    : `http://localhost:9000/iterninsight/${image}`;
});


</script>


<template>
  <div class="fixed inset-0 bg-gray-100 flex flex-col items-center justify-center overflow-hidden space-y-4">

    <!-- 🏷️ Title นอกกล่องขาว -->
    <h1 class="text-2xl font-bold text-hightlight mb-6 text-center">User Profile</h1>


    <!-- กล่องขาว -->
    <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">

      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <template v-if="imageUrl">
          <img :src="imageUrl" class="w-16 h-16 rounded-full object-cover border" />
        </template>
        <template v-else>
          <div
            class="w-16 h-16 rounded-full bg-[#00465e] text-white flex items-center justify-center text-xl font-bold">
            {{ user?.name?.charAt(0).toUpperCase() || '?' }}
          </div>
        </template>

        <div>
          <p class="text-xl font-bold text-hightlight">{{ user?.name }}</p>
        </div>
      </div>

      <!-- Info Section -->
      <div class="text-lg text-gray-800 space-y-4">
        <div class="flex justify-between border-b pb-1">
          <span class="font-medium text-gray-600">Position</span>
          <span>{{ user?.position || '-' }}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="font-medium text-gray-600">Phone</span>
          <span>{{ user?.phone || '-' }}</span>
        </div>
        <div class="flex justify-between border-b pb-1">
          <span class="font-medium text-gray-600">Email</span>
          <span>{{ user?.email || '-' }}</span>
        </div>
        <div class="border-b pb-2 grid grid-cols-[90px_1fr] items-start gap-x-2">
          <span class="font-medium text-gray-600">About</span>
          <span class="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {{ user?.description || '-' }}
          </span>
        </div>
      </div>

      <!-- Back Button -->
      <button @click="$router.back()" class="inline-block mt-4 text-hightlight hover:underline text-sm">
        « Back
      </button>
    </div>
  </div>
</template>
