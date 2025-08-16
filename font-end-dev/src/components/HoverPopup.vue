<template>
  <div class="absolute bg-white border shadow-lg rounded-lg p-4 w-64 z-50">
    <router-link :to="`/users/${user.id}`" class="flex items-start gap-3 no-underline hover:underline">
      <div class="w-10 h-10 rounded-full flex items-center justify-center border overflow-hidden">
        <template v-if="isValidImage(user?.image)">
          <img
            :src="getImageUrl(user.image)"
            alt="Profile"
            class="w-10 h-10 rounded-full object-cover border" />
        </template>
        <template v-else>
          <div
            class="w-10 h-10 rounded-full bg-[#00465e] text-white flex items-center justify-center text-xl font-bold">
            {{ user?.name?.charAt(0).toUpperCase() || '?' }}
          </div>
        </template>
      </div>
      <div>
        <p class="font-bold text-base text-black">{{ user.name }}</p>
        <p class="text-gray-600 text-sm">{{ user.position }}</p>
        <p class="text-gray-500 text-sm truncate">{{ user.email }}</p>
        <p class="text-gray-500 text-sm mt-1 line-clamp-2">{{ user.description }}</p>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: number;
  email: string;
  username?: string;
  name: string;
  phone?: string;
  position: string;
  description: string;
  image: string;
}

const props = defineProps<{ user: User }>();

const user = props.user;

const isValidImage = (img?: string): boolean => {
  if (!img) return false;
  const trimmed = img.trim().toLowerCase();
  return trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined' && trimmed !== 'default.jpg';
};

const getImageUrl = (img: string) => {
  return img.startsWith('http') ? img : `http://localhost:9000/iterninsight/${img}`;
};
</script>
