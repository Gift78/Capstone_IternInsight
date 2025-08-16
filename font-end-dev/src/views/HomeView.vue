<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { ref, onMounted, onUnmounted, } from 'vue';

const route = useRoute();
const isDropdownOpen = ref(false);
const isLoggedIn = ref(false);

function checkLoginStatus() {
  const token = localStorage.getItem('token');
  isLoggedIn.value = Boolean(token && token !== 'undefined' && token !== '');
}

function handleLogin() {
  isLoggedIn.value = true;
}

function handleLogout() {
  // refresh the page to update the login status
  window.location.reload();
  isLoggedIn.value = false;
}

function handleStorageChange(event: StorageEvent) {
  if (event.key === 'token') {
    checkLoginStatus();
  }
}

onMounted(() => {
  checkLoginStatus(); // ✅ โหลดหน้าเช็คสถานะก่อน
  window.addEventListener('user-logged-in', handleLogin);
  window.addEventListener('user-logged-out', handleLogout);
  window.addEventListener('storage', handleStorageChange);
});

onUnmounted(() => {
  window.removeEventListener('user-logged-in', handleLogin);
  window.removeEventListener('user-logged-out', handleLogout);
  window.removeEventListener('storage', handleStorageChange);
});
</script>

<template>
  <div class="flex flex-col items-center">
    <img src="../assets/bg-home.jpg" alt="" class="relative bg-gray-200 w-full h-fit max-h-[520px]" />

    <div class="absolute left-16 top-48 text-white z-10 flex flex-row items-start">
      <div class="w-[20px] h-[256px] bg-white mr-4 rounded-sm"></div>

      <div class="flex flex-col leading-tight text-8xl font-bold uppercase space-y-4">
        <p>TERN</p>
        <p>NSIGHT</p>
      </div>
    </div>

    <div class="flex flex-row justify-center items-center">
      <RouterLink
        to="/posts"
        :class="{ 'border-b border-hightlight': route.path === '/posts' }"
        class="px-5 py-2.5 text-hightlight font-medium md:text-lg lg:text-xl"
      >
        Announcement
      </RouterLink>

      <template v-if="isLoggedIn">
        <div class="relative">
          <button
            @click="isDropdownOpen = !isDropdownOpen"
            :class="{
              'border-b border-hightlight':
                route.path === '/reviews' || route.path === '/questions',
            }"
            class="px-5 py-2.5 text-hightlight font-medium md:text-lg lg:text-xl"
          >
            Threads
          </button>

          <div
            v-if="isDropdownOpen"
            class="absolute left-0 mt-2 py-2 bg-white border rounded shadow-lg text-light-text dark:bg-dark-background z-10"
          >
            <RouterLink
              to="/reviews"
              class="block px-4 py-2 text-light-text hover:text-hightlight dark:hover:bg-dark-secondary/5"
              @click="isDropdownOpen = false"
            >
              Review
            </RouterLink>
            <RouterLink
              to="/questions"
              class="block px-4 py-2 text-light-text hover:text-hightlight dark:hover:bg-dark-secondary/5"
              @click="isDropdownOpen = false"
            >
              Question
            </RouterLink>
          </div>
        </div>
      </template>
    </div>

    <RouterView />
  </div>
</template>
