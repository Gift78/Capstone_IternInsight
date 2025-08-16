
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import axios from 'axios'
import Filter from '../../components/FilterComp.vue'
import router from '@/router'
import { AxiosError } from 'axios';

interface Company {
  id: number
  companyName: string
}

// Define the Post interface
interface Post {
  id: number
  title: string
  description: string
  position: string
  startDate: Date | null
  endDate: Date
  company: Company
}

// Declare posts array and loading state
const posts = ref<Post[]>([])
const isLoading = ref(true) // loading state
const searchKeyword = ref('') // search keyword
const selectedPosition = ref('') // position filter
const startDateSelected = ref('') // start date filter
const endDateSelected = ref('') // end date filter

const showModal = ref(false)
const postIdToDelete = ref<number | null>(null)

const fetchData = async () => {
  try {
    const token = localStorage.getItem('token'); // ดึง JWT Token จาก Local Storage
    if (!token) {
      throw new Error('Unauthorized: No token found');
    }

    const response = await axios.get('http://localhost:3000/posts', {
      headers: {
        Authorization: `Bearer ${token}`, // เพิ่ม JWT Token ใน Header
      },
    });

    posts.value = response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching posts:', error.message);
    } else {
      console.error('An unknown error occurred:', error);
    }
  } finally {
    isLoading.value = false; // ตั้งค่า isLoading เป็น false ไม่ว่าจะสำเร็จหรือเกิดข้อผิดพลาด
  }
};

const deleteAnnouncement = async (id: number) => {
  try {
    const token = localStorage.getItem('token'); // ดึง JWT Token จาก Local Storage
    if (!token) {
      throw new Error('Unauthorized: No token found');
    }

    await axios.delete(`http://localhost:3000/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // เพิ่ม JWT Token ใน Header
      },
    });

    console.log('Announcement deleted successfully');
    fetchData(); // Refresh the list after deletion
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      // การจัดการข้อผิดพลาดจาก axios
      console.error('Error deleting announcement:', error.response?.data || error.message);
    } else if (error instanceof Error) {
      // การจัดการข้อผิดพลาดทั่วไป
      console.error('Error deleting announcement:', error.message);
    } else {
      console.error('An unknown error occurred:', error);
    }
  }
};

onMounted(fetchData)

const positions = computed(() => {
  const uniquePositions = new Set(posts.value.map((post) => post.position))
  return Array.from(uniquePositions)
})

const confirmDelete = (id: number) => {
  // Show the modal when the user clicks delete
  postIdToDelete.value = id
  showModal.value = true
}

const handleDelete = () => {
  if (postIdToDelete.value !== null) {
    deleteAnnouncement(postIdToDelete.value)
    showModal.value = false
    router.push('/admin/annouce')
  }
}

const cancelDelete = () => {
  showModal.value = false // Close the modal if the user cancels
}

// Filtered reviews based on search keyword, selected position, and date range
const filteredReviews = computed(() => {
  return posts.value.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchKeyword.value.toLowerCase())

    const matchesPosition = !selectedPosition.value || post.position === selectedPosition.value

    const postStartDate = post.startDate ? new Date(post.startDate) : null
    const postEndDate = new Date(post.endDate)

    const matchesDateRange =
      (!startDateSelected.value ||
        !postStartDate ||
        postStartDate <= new Date(startDateSelected.value)) &&
      (!endDateSelected.value || postEndDate <= new Date(endDateSelected.value))

    return matchesSearch && matchesPosition && matchesDateRange
  })
})

</script>

<template>
  <Filter
    class="my-2"
    @updateSearch="searchKeyword = $event"
    @updatePosition="selectedPosition = $event"
    @updateStartDate="startDateSelected = $event"
    @updateEndDate="endDateSelected = $event"
    :positions="positions"
  />
  <div
    class="font-Prompt px-2 mt-2 space-y-2 w-full sm:px-12 md:px-16 lg:px-32 lg:py-4 xl:px-56 2xl:px-96"
  >
    <div v-if="isLoading" class="text-center">Loading...</div>
    <div
      v-if="filteredReviews.length === 0 && !isLoading"
      class="text-center text-lg text-gray-500"
    >
      Post not found
    </div>
    <!-- Check if posts array has data before rendering the first and second post -->
    <div v-if="filteredReviews.length > 0">
      <div
        v-for="(post, index) in filteredReviews"
        :key="index"
        class="flex flex-row justify-between items-center font-Prompt border-border border-b py-2"
      >
        <div class="flex flex-row gap-2">
          <span class="text-sm md:text-base lg:text-lg"> {{ post.title }} </span>
        </div>
        <div class="flex flex-row gap-2 items-center">
          <RouterLink
            :to="`/admin/annouce/${post.id}`"
            class="text-xs font-medium text-white bg-gradient-to-b from-button to-button/20 px-4 py-1 rounded-lg border-border border shadow-sm md:text-sm lg:text-base"
          >
            Read more
          </RouterLink>
          <RouterLink
            :to="`/admin/edit-annouce/${post.id}`"
            class="w-9 h-9 border-2 border-hightlight rounded-md flex items-center justify-center bg-white text-hightlight"
          >
            <i class="fas fa-pen"></i>
          </RouterLink>

          <button
            @click="confirmDelete(post.id)"
            class="w-9 h-9 border-2 border-hightlight rounded-md flex items-center justify-center bg-white text-hightlight"
          >
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="showModal"
    class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
  >
    <div class="bg-white p-6 rounded-lg w-80">
      <h3 class="text-lg font-bold mb-4">
        Are you sure you want to delete this post
        <span class="text-lg font-bold mb-4 text-red-500"
          >[ {{ posts.find((post) => post.id === postIdToDelete)?.title }} ]</span
        >?
      </h3>
      <div class="flex justify-between gap-4">
        <button @click="handleDelete" class="w-full bg-red-600 text-white py-2 rounded-md">
          Confirm
        </button>
        <button @click="cancelDelete" class="w-full bg-gray-400 text-white py-2 rounded-md">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
