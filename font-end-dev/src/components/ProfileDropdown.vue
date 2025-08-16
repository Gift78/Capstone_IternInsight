<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import editIcon from '@/assets/EditProfile.png';
import logoutIcon from '@/assets/logout.png';

const router = useRouter();
const route = useRoute();

const user = ref<{ name: string; email?: string; image?: string; role?: string } | null>(null);
const showMenu = ref(false);
const isLoggedIn = ref(false);

const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  window.dispatchEvent(new Event('user-logged-out'));
  router.push('/posts');
};

const updateUser = () => {
  const stored = localStorage.getItem('user');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (!parsed.name && parsed.email) {
      parsed.name = parsed.email.split('@')[0];
    }
    user.value = parsed;
    isLoggedIn.value = true;
  } else {
    user.value = null;
    isLoggedIn.value = false;
  }
};

onMounted(() => {
  updateUser();
  window.addEventListener('user-logged-in', updateUser);
});

onBeforeUnmount(() => {
  window.removeEventListener('user-logged-in', updateUser);
});

watch(route, () => {
  showMenu.value = false;
  updateUser();
});

const goToEditProfile = () => {
  router.push('/edit-profile');
};

const isValidImage = (img?: string): boolean => {
  if (!img) return false;
  const trimmed = img.trim().toLowerCase();
  return trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined' && trimmed !== 'default.jpg';
};

const profileImageUrl = computed(() => {
  const image = user.value?.image;
  if (!isValidImage(image)) {
    return null;
  }
  return image!.startsWith('http')
    ? image
    : `http://localhost:9000/iterninsight/${image}?t=${Date.now()}`;
});
</script>

<template>
  <div v-if="isLoggedIn" class="relative">
    <!-- Profile Button -->
    <div class="flex items-center gap-2 cursor-pointer" @click.stop="showMenu = !showMenu">
      <span class="font-semibold hidden sm:inline text-white text-xl">{{ user?.name }}</span>
      <div
        class="w-8 h-8 rounded-full bg-white text-primary font-bold flex items-center justify-center uppercase overflow-hidden relative">
        <img v-if="profileImageUrl" :src="profileImageUrl" alt="Profile"
          class="w-full h-full object-cover absolute top-0 left-0" />
        <span v-else class="z-10">
          {{ user?.name ? user.name.charAt(0).toUpperCase() : '?' }}
        </span>
      </div>
    </div>

    <!-- Dropdown Menu -->
    <div v-if="showMenu" class="absolute right-0 mt-2 bg-white rounded-lg shadow-lg w-64 p-4 z-50 text-black"
      @click.stop>
      <div class="absolute -top-2 right-4 w-4 h-4 bg-white transform rotate-45 shadow-md"></div>

      <!-- User Info -->
      <div class="flex items-center gap-3 mb-3">
        <div style="width: 48px; height: 48px; border-radius: 50%; overflow: hidden;"
          class="bg-white text-primary font-bold flex items-center justify-center uppercase relative">
          <img v-if="profileImageUrl" :src="profileImageUrl" alt="Profile"
            style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; position: absolute; top: 0; left: 0;" />
          <span v-else class="z-10">
            {{ user?.name ? user.name.charAt(0).toUpperCase() : '?' }}
          </span>
        </div>

        <div>
          <p class="font-semibold leading-4 text-primary">{{ user?.name }}</p>
          <p class="text-sm text-gray-700">{{ user?.email }}</p>
        </div>
      </div>

      <hr class="my-2 border-gray-300" />

      <!-- Menu Options -->
      <div class="flex flex-col gap-2">
        <button class="flex items-center gap-2 text-primary hover:underline" @click="goToEditProfile">
          <img :src="editIcon" alt="Edit" class="w-5 h-5" />
          Edit Profile
        </button>

        <RouterLink :to="{ path: '/posts', query: { bookmarked: 'true' } }"
          class="dropdown-item flex items-center gap-2 text-primary hover:underline">
          <img src="../assets/bookmark.png" width="18" height="18" />
          <span>Saved</span>
        </RouterLink>

        <button class="flex items-center gap-2 text-red-600 hover:underline" @click="logout">
          <img :src="logoutIcon" alt="Logout" class="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
