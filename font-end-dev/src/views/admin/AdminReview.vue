
<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { RouterLink, useRoute, useRouter } from 'vue-router'
  import axios from 'axios'
  import FilterComp from '@/components/FilterComp.vue'

  interface Review {
  id: number;
  title: string;
  description: string;
  date: string;
  position?: string;
  company?: string;
}

  // Use the Review type instead of any[]
  const reviews = ref<Review[]>([])
  const route = useRoute()
  const router = useRouter()
  const showModal = ref(false)
  const deleteId = ref<number | null>(null)
  const deleteTitle = ref('')
  // const id = route.params.id;


  // ตัวแปรสำหรับ Search Bar & Date Filter
  const searchKeyword = ref('')
  const selectedPosition = ref('')
  const startDate = ref('')
  const endDate = ref('')

  // โหลดข้อมูลรีวิวจาก API
  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Unauthorized: No token found');
      }

      const response = await axios.get('http://localhost:3000/reviews', {
        headers: {
          Authorization: `Bearer ${token}`, // ส่ง Token ใน Header
        },
      });

      reviews.value = response.data;
      console.log('Reviews fetched successfully:', response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching reviews:', error);
        if (error.response && error.response.status === 401) {
          alert('Unauthorized: Please log in again.');
          router.push('/login'); // เปลี่ยนเส้นทางไปยังหน้า Login
        }
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  // ฟังก์ชันกรองข้อมูลรีวิว
  const filteredReviews = computed(() => {
    return reviews.value.filter((review) => {
      const matchesSearch =
        review.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        review.description.toLowerCase().includes(searchKeyword.value.toLowerCase())

      const matchesPosition = !selectedPosition.value || review.position === selectedPosition.value

      const reviewDate = new Date(review.date)
      const matchesDateRange =
        (!startDate.value || reviewDate >= new Date(startDate.value)) &&
        (!endDate.value || reviewDate <= new Date(endDate.value))

      return matchesSearch && matchesPosition && matchesDateRange
    })
  })

  // เรียงลำดับให้รีวิวล่าสุดอยู่ด้านบน
  const sortedReviews = computed(() => {
    return filteredReviews.value.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  // แสดง Modal ยืนยันการลบ
  const confirmDelete = (id: number, title: string) => {
    deleteId.value = id
    deleteTitle.value = title
    showModal.value = true
  }

  // ฟังก์ชันลบรีวิว
  const handleDelete = async () => {
  if (deleteId.value !== null) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized: No token found');

      await axios.delete(`http://localhost:3000/reviews/${deleteId.value}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      reviews.value = reviews.value.filter(review => review.id !== deleteId.value);
      deleteId.value = null;
      deleteTitle.value = '';
      showModal.value = false;
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  }
};


  // ยกเลิกการลบ
  const cancelDelete = () => {
    showModal.value = false
    deleteId.value = null
    deleteTitle.value = ''
  };

  // ฟังก์ชันจัดรูปแบบวันที่เท่านั้น
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // โหลดข้อมูลเมื่อ Component ถูกสร้าง
  onMounted(fetchReviews)

  // State to manage dropdown visibility
  const isDropdownOpen = ref(false)
  </script>


<template>
  <!-- Header Section -->
  <div class="flex flex-row justify-between items-center w-full px-10">
        <div class="flex flex-row justify-center flex-1">
          <RouterLink to="/admin/annouce" class="px-5 py-2.5 text-hightlight font-medium md:text-lg lg:text-xl">
            Announcement
          </RouterLink>

          <!-- Threads Button with Dropdown -->
          <div class="relative">
            <button
              @click="isDropdownOpen = !isDropdownOpen"
              :class="{
                'border-b border-hightlight': route.path === '/admin/review' || route.path === '/admin/question',
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

        <!-- ปุ่ม Add Question -->
        <RouterLink :to="{ path: '/admin/add-review', query: { from: 'admin' } }"
          class="text-white text-xs font-bold bg-gradient-to-b from-button px-4 py-1.5 h-fit to-button/50 shadow-md rounded-lg lg:text-sm">
          Add review
        </RouterLink>
      </div>


      <!-- 🔍 Search Bar & Date Filters -->
      <FilterComp
        class="mt-4"
        @updateSearch="searchKeyword = $event"
      />

      <!-- Reviews Grid Partial Content -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-16 mt-8">
        <div v-for="review in sortedReviews" :key="review.id" class="border p-4 rounded-lg bg-white shadow">
          <h2 class="text-lg font-bold truncate">{{ review.title }}</h2>
          <p class="text-sm font-medium text-gray-600 truncate">{{ review.company }}</p>
          <p class="text-sm mt-2 text-gray-700 line-clamp-2">{{ review.description.substring(0, 60) }}...</p>
          <small class="text-xs text-gray-400">{{ formatDate(review.date) }}</small>
          <div class="flex justify-between items-center mt-3">
            <RouterLink :to="`/admin/review/${review.id}`" class="bg-gradient-to-b from-button to-button/55 text-white py-1 px-3 rounded">Read more</RouterLink>
            <div class="flex gap-2">
              <RouterLink :to="`/admin/edit-review/${review.id}?from=admin`" class="text-hightlight hover:underline">
  <i class="fas fa-edit"></i>
</RouterLink>

              <button @click="confirmDelete(review.id, review.title)" class="text-hightlight hover:underline"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal for delete confirmation -->
      <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
        <div class="bg-white p-6 rounded-lg w-96 shadow-lg">
          <h3 class="text-lg font-bold mb-6 text-center">
            ⚠️ Are you sure you want to delete this post
            <span class="text-red-600">[ {{ deleteTitle }} ]</span>?
          </h3>
          <div class="flex justify-center gap-6">
            <button @click="handleDelete" class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Confirm</button>
            <button @click="cancelDelete" class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">Cancel</button>
          </div>
        </div>
      </div>
  </template>
