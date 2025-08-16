
<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter} from 'vue-router'
import { ref, onMounted, computed } from 'vue'

const route = useRoute()
const router = useRouter()

// State to manage dropdown visibility
const isDropdownOpen = ref(false)
const isLoggedIn = ref(!!localStorage.getItem('user'))

const showAddAnnounceButton = computed(() => {
  return route.path === '/admin/annouce' || route.path.startsWith('/admin/detail-annouce');
});

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'admin') {
    router.push('/403');
  }
});
</script>

<template>
  <div class="flex flex-col items-center">
    <button
      v-if="!isLoggedIn"
      @click="router.push('/login')"
      class="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
    >
      Login
    </button>
    <img
      src="../../assets/bg-home.jpg"
      alt=""
      class="relative bg-gray-200 w-full h-fit max-h-[520px]"
    />

    <div class="absolute left-16 top-48 text-white z-10 flex flex-row items-start">
      <div class="w-[20px] h-[256px] bg-white mr-4 rounded-sm"></div>

      <div class="flex flex-col leading-tight text-8xl font-bold uppercase space-y-4">
        <p>TERN</p>
        <p>NSIGHT</p>
      </div>
    </div>

    <div class="flex flex-row justify-between items-center w-full px-10">
      <!-- Left Section -->
      <div class="flex flex-row justify-center flex-1">
        <RouterLink
          to="/admin/annouce"
          :class="{
            'border-b border-hightlight': route.path === '/admin/annouce',
          }"
          class="px-5 py-2.5 text-hightlight font-medium md:text-lg lg:text-xl"
        >
          Announcement
        </RouterLink>

        <!-- Threads Button with Dropdown -->
        <div class="relative">
          <button
            @click="isDropdownOpen = !isDropdownOpen"
            :class="{
              'border-b border-hightlight': route.path === '/reviews' || route.path === '/questions',
            }"
            class="px-5 py-2.5 text-hightlight font-medium md:text-lg lg:text-xl"
          >
            Threads
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="isDropdownOpen"
            class="absolute left-0 mt-2 py-2 bg-white border rounded shadow-lg text-light-text dark:bg-dark-background z-10"
          >
            <RouterLink
              to="/admin/review"
              class="block px-4 py-2 text-light-text hover:text-hightlight dark:hover:bg-dark-secondary/5"
              @click="isDropdownOpen = false"
            >
              Review
            </RouterLink>
            <RouterLink
              to="/admin/question"
              class="block px-4 py-2 text-light-text hover:text-hightlight dark:hover:bg-dark-secondary/5"
              @click="isDropdownOpen = false"
            >
              Question
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Right Section: Add Announcement Button -->
      <RouterLink
        to="/admin/add-annouce"
        v-if="showAddAnnounceButton"
        class="text-white text-xs font-bold bg-gradient-to-b from-button px-4 py-1.5 h-fit to-button/50 shadow-md rounded-lg lg:text-sm"
      >
        Add Announcement
      </RouterLink>
    </div>

    <RouterView />


  </div>
</template>
