<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import axios from 'axios'
import Filter from '../components/FilterComp.vue'
// import { fa } from 'vuetify/locale'
import { RouterLink } from 'vue-router'
import { useRoute } from 'vue-router'
import iconfilled from '../assets/bookmark-filled.png'
import iconout from '@/assets/bookmark-outline.png'


const route = useRoute()
const isBookmarkView = ref(false)

const fetchBookmarkedPosts = async () => {
  try {
    isLoading.value = true
    const response = await axios.get<Post[]>('http://localhost:3000/posts')
    posts.value = response.data
      .filter((post) => post.isBookmarked)
      .map((post) => ({
        id: post.id,
        title: post.title,
        subtitle: post.subtitle,
        description: post.description,
        position: post.position,
        startDate: post.startDate ? new Date(post.startDate) : null,
        endDate: new Date(post.endDate),
        company: post.company,
        isBookmarked: post.isBookmarked,
      }))
  } catch (error) {
    console.error('Error fetching bookmarked posts:', error)
  } finally {
    isLoading.value = false
  }
}


interface Company {
  id: number
  companyName: string
}

// Define the Post interface
interface Post {
  id: number
  title: string
  subtitle: string
  description: string
  position: string
  startDate: Date | null
  endDate: Date
  company: Company
  isBookmarked?: boolean
}

// Declare posts array and loading state
const posts = ref<Post[]>([])
const isLoading = ref(true) // loading state
const searchKeyword = ref('') // search keyword
const selectedPosition = ref('') // position filter
const startDateSelected = ref('') // start date filter
const endDateSelected = ref('') // end date filter

const fetchData = async () => {
  try {
    const response = await axios.get<Post[]>('http://localhost:3000/posts')

    // เตรียม token ไว้ใช้สำหรับตรวจสอบ bookmark
    const token = localStorage.getItem('token')

    // สร้าง post object เบื้องต้นก่อนอัปเดต bookmark
    posts.value = response.data.map((post) => ({
      id: post.id,
      title: post.title,
      subtitle: post.subtitle,
      description: post.description,
      position: post.position,
      startDate: post.startDate ? new Date(post.startDate) : null,
      endDate: new Date(post.endDate),
      company: {
        id: post.company.id,
        companyName: post.company.companyName,
      },
      isBookmarked: false, // ตั้งค่าเริ่มต้น
    }))

    // ถ้ามี token ให้เรียกหาสถานะ bookmark
    if (token) {
      const bookmarkStatuses = await Promise.all(
        posts.value.map(async (post) => {
          try {
            const res = await axios.get(`http://localhost:3000/posts/${post.id}/bookmark`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            return res.data.data === true
          } catch (err) {
            console.warn(`Failed to fetch bookmark for post ${post.id}`, err)
            return false
          }
        })
      )
      // print all bookmark statuses
      // console.log('Bookmark statuses:', bookmarkStatuses)

      // อัปเดต isBookmarked ตามผลลัพธ์
      posts.value = posts.value.map((post, index) => ({
        ...post,
        isBookmarked: bookmarkStatuses[index],
      }))
    }
  } catch (error) {
    console.error('Error fetching data', error)
  } finally {
    isLoading.value = false
  }
}



const toggleBookmark = async (post: Post) => {
  const token = localStorage.getItem('token')
  if (!token) return alert('Please login first')

  try {
    await axios({
      method: post.isBookmarked ? 'DELETE' : 'POST',
      url: `http://localhost:3000/posts/${post.id}/bookmark`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // สลับสถานะหลังจากสำเร็จ
    post.isBookmarked = !post.isBookmarked
    // ลบออกจากลิสต์ถ้าอยู่ในหน้า bookmarked
    if (isBookmarkView.value && !post.isBookmarked) {
      posts.value = posts.value.filter((p) => p.id !== post.id)
    }
  } catch (error) {
    console.error('Bookmark operation failed:', error)
  }
}


onMounted(async () => {
  await fetchData()
  if (route.query.bookmarked === 'true') {
    isBookmarkView.value = true
    fetchBookmarkedPosts()
    return
  }
  // await fetchBookmarks()
})

// Filtered reviews based on search keyword, selected position, and date range
const filteredReviews = computed(() => {
  return posts.value.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      post.subtitle.toLowerCase().includes(searchKeyword.value.toLowerCase());

    const matchesPosition = !selectedPosition.value || post.position.includes(selectedPosition.value);

    const postStartDate = post.startDate ? new Date(post.startDate) : null;
    const postEndDate = new Date(post.endDate);

    const matchesDateRange =
      (!startDateSelected.value ||
        !postStartDate ||
        postStartDate <= new Date(startDateSelected.value)) &&
      (!endDateSelected.value || postEndDate >= new Date(endDateSelected.value));

    return matchesSearch && matchesPosition && matchesDateRange;
  });
});

const positions = computed(() => {
  const allPositions = posts.value.flatMap((post) => post.position);
  const uniquePositions = new Set(allPositions); // This ensures only unique positions
  return Array.from(uniquePositions);
});

onMounted(async () => {
  const token = localStorage.getItem('token')
  try {
    if (route.query.bookmarked === 'true') {
      // ✅ ดึงเฉพาะโพสต์ที่ผู้ใช้ bookmark ไว้
      const res = await axios.get('http://localhost:3000/posts/bookmarks/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // ตรวจสอบว่า res.data เป็น array
      if (Array.isArray(res.data)) {
        posts.value = res.data.map(post => ({
          ...post,
          isBookmarked: true
        }))
      } else {
        posts.value = []
      }

    } else {
      // ✅ ดึงโพสต์ทั้งหมด และกำหนด isBookmarked จากข้อมูล likes[]
      await fetchData()
    }
  } catch (error) {
    console.error('Error loading posts:', error)
    posts.value = [] // ป้องกันการแสดงโพสต์ค้างถ้าโหลดไม่สำเร็จ
  } finally {
    isLoading.value = false
  }
})


</script>

<template>
  <Filter class="my-2" @updateSearch="searchKeyword = $event" @updatePosition="selectedPosition = $event"
    @updateStartDate="startDateSelected = $event" @updateEndDate="endDateSelected = $event" :positions="positions" />

  <!-- ✅ ส่วนแสดงโพสต์ที่ bookmark -->
  <div v-if="route.query.bookmarked === 'true'"
    class="font-Prompt px-2 mt-2 space-y-2 w-full sm:px-12 md:px-16 lg:px-32 lg:py-4 xl:px-56 2xl:px-96">
    <h2 class="text-xl font-bold">Saved Posts</h2>
    <div v-if="posts.length === 0" class="text-center text-gray-500">No bookmarks found.</div>

    <template v-for="post in posts" :key="post.id">
      <div v-if="post.isBookmarked"
        class="flex flex-row justify-between items-center font-Prompt border-border border-b py-2 relative">
        <span class="text-sm md:text-base lg:text-lg"> {{ post.title }} </span>
        <div class="flex items-center gap-2">
          <button @click.stop.prevent="toggleBookmark(post)">
            <img :src="iconfilled" class="w-5 h-5" />
          </button>

          <RouterLink :to="`posts/${post.id}`"
            class="text-xs font-medium text-white bg-gradient-to-b from-button to-button/20 px-4 py-1 rounded-lg border-border border shadow-sm md:text-sm lg:text-base">
            Read more
          </RouterLink>
        </div>
      </div>
    </template>
  </div>


  <div v-else class="font-Prompt px-2 mt-2 space-y-2 w-full sm:px-12 md:px-16 lg:px-32 lg:py-4 xl:px-56 2xl:px-96">
    <div v-if="isLoading" class="text-center">Loading...</div>

    <div v-if="filteredReviews.length === 0 && !isLoading" class="text-center text-lg text-gray-500">
      Post not found
    </div>

    <div v-if="filteredReviews.length > 0" class="relative">
      <RouterLink :to="`posts/${filteredReviews[0].id}`"
        class="flex flex-row border border-border gap-x-4 pr-4 items-start h-full relative">
        <img src="http://localhost:9000/iterninsight/33ba28852218564451f9b6ef0d8d1ca1.png"
          class="bg-gray-200 w-[120px] aspect-[3/2] border-r border-border md:w-[200px] lg:w-[280px] xl:w-[320px] 2xl:w-[400px]" />
        <div class="flex flex-col gap-y-1 w-full py-2 xl:gap-y-2">
          <div class="text-hightlight font-bold text-sm w-full md:text-lg lg:text-xl">
            {{ filteredReviews[0].title }}
          </div>
          <p class="text-xs text-gray-600 line-clamp-3 md:text-sm lg:text-base">
            {{ filteredReviews[0].description }}
          </p>
          <span class="text-subtext text-xs md:text-base lg:text-lg">
            {{ filteredReviews[0].subtitle }}
          </span>
          <button
            class="hidden mt-2 text-xs font-medium text-white w-fit bg-gradient-to-b from-button to-button/40 px-4 py-1 rounded-lg border-border border shadow-sm md:block md:text-sm lg:text-base">
            Read more
          </button>
        </div>
      </RouterLink>
      <button @click.stop.prevent="toggleBookmark(filteredReviews[0])" class="absolute top-2 right-2 z-10">
        <img :src="filteredReviews[0].isBookmarked ? iconfilled : iconout" class="w-6 h-6" />
      </button>
    </div>

    <div v-if="filteredReviews.length > 1" class="relative">
      <RouterLink :to="`posts/${filteredReviews[1].id}`"
        class="flex flex-row border border-border gap-x-4 pl-4 items-start relative">
        <div class="flex flex-col gap-y-1 w-full py-2 xl:gap-y-2">
          <div class="text-hightlight font-bold text-sm md:text-lg lg:text-xl">
            {{ filteredReviews[1].title }}
          </div>
          <span class="text-subtext text-xs md:text-base lg:text-lg">
            {{ filteredReviews[1].subtitle }}
          </span>
          <button
            class="hidden mt-2 text-xs font-medium text-white w-fit bg-gradient-to-b from-button to-button/40 px-4 py-1 rounded-lg border-border border shadow-sm md:block md:text-sm lg:text-base">
            Read more
          </button>
        </div>
        <img src="http://localhost:9000/iterninsight/9f349a52e3642853ef6756f52f75cd90.png"
          class="bg-gray-200 w-[120px] aspect-[3/2] border-r border-border md:w-[200px] lg:w-[280px] xl:w-[320px] 2xl:w-[400px]" />
      </RouterLink>
      <button @click.stop.prevent="toggleBookmark(filteredReviews[1])" class="absolute top-2 right-2 z-10">
        <img :src="filteredReviews[1].isBookmarked ? iconfilled : iconout" class="w-6 h-6" />
      </button>
    </div>

    <div v-if="filteredReviews.length > 2">
      <h1 class="text-hightlight font-bold flex items-center md:text-lg lg:text-xl">
        Other Announce
        <span class="relative inline-flex ml-2">
          <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary -top-1"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-primary -top-1"></span>
        </span>
      </h1>
      <div v-for="(post, index) in filteredReviews.slice(2)" :key="index"
        class="flex flex-row justify-between items-center font-Prompt border-border border-b py-2 relative">
        <span class="text-sm md:text-base lg:text-lg"> {{ post.title }} </span>
        <div class="flex items-center gap-2">
          <button @click.stop.prevent="toggleBookmark(post)">
            <img :src="post.isBookmarked ? iconfilled : iconout" class="w-5 h-5" />
          </button>
          <RouterLink :to="`posts/${post.id}`"
            class="text-xs font-medium text-white bg-gradient-to-b from-button to-button/20 px-4 py-1 rounded-lg border-border border shadow-sm md:text-sm lg:text-base">
            Read more
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
