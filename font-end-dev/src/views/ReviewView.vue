<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import axios from 'axios';
import Filter from '../components/FilterComp.vue';

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

interface ReviewLike {
  user?: User;
}

interface Review {
  id: number;
  title: string;
  position?: string;
  description: string;
  date: string;
  company?: string;
  userName?: string;
  like?: ReviewLike[];
  isLikedByUser?: boolean;
  likesCount?: number;
}

const reviews = ref<Review[]>([]);
const isLoading = ref(true);
const searchKeyword = ref('');
const selectedPosition = ref('');
const startDate = ref('');
const endDate = ref('');
const router = useRouter();
const showingMyReviews = ref(false);
const user: User | null = JSON.parse(localStorage.getItem('user') || 'null');

const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  const payload = JSON.parse(atob(token.split('.')[1]));
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp > currentTime;
};

if (!isTokenValid()) {
  alert('Session expired. Please log in again.');
  localStorage.removeItem('token');
  router.push('/login');
}

const fetchAllReviews = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Unauthorized: No token found');

    const response = await axios.get('http://localhost:3000/reviews', {
      headers: { Authorization: `Bearer ${token}` },
    });
    reviews.value = response.data.map(transformReview);
    showingMyReviews.value = false;
  } catch (error) {
    console.error('Error fetching data', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchMyReviews = async () => {
  try {
    isLoading.value = true;
    const token = localStorage.getItem('token');
    const userId = user?.id;
    if (!token || !user) throw new Error('Unauthorized');

    const response = await axios.get(`http://localhost:3000/reviews/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    reviews.value = response.data.map(transformReview);
    showingMyReviews.value = true;
  } catch (error) {
    console.error('Error fetching my reviews:', error);
  } finally {
    isLoading.value = false;
  }
};

const transformReview = (q: Review): Review => {
  const liked = q.like?.some((l) => l.user?.id === user?.id);
  return {
    ...q,
    isLikedByUser: liked,
    likesCount: q.like?.length || 0,
  };
};

const likeReview = async (q: Review) => {
  const token = localStorage.getItem('token');
  q.isLikedByUser = true;
  q.likesCount = (q.likesCount || 0) + 1;
  reviews.value = [...reviews.value];
    try {
    await axios.post(`http://localhost:3000/reviews/${q.id}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (e) {
    q.isLikedByUser = false;
    q.likesCount = (q.likesCount || 1) - 1;

    console.error('Like failed', e);

  }
};

const unlikeReview = async (q: Review) => {
  const token = localStorage.getItem('token');
  q.isLikedByUser = false;
  q.likesCount = Math.max((q.likesCount || 1) - 1, 0);
  reviews.value = [...reviews.value];
  try {
    await axios.post(`http://localhost:3000/reviews/${q.id}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (e) {
    q.isLikedByUser = true;
    q.likesCount = (q.likesCount || 0) + 1;
    reviews.value = [...reviews.value];
    console.error('Unlike fallback failed', e);
  }
};

const positions = computed(() => {
  const uniquePositions = new Set(reviews.value.map((review) => review.position).filter(Boolean));
  return Array.from(uniquePositions) as string[];
});

const filteredReviews = computed(() => {
  return reviews.value.filter((review) => {
    const matchesSearch =
      review.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      review.description.toLowerCase().includes(searchKeyword.value.toLowerCase());

    const matchesPosition = !selectedPosition.value || review.position === selectedPosition.value;

    const reviewDate = new Date(review.date);
    const matchesDateRange =
      (!startDate.value || reviewDate >= new Date(startDate.value)) &&
      (!endDate.value || reviewDate <= new Date(endDate.value));

    return matchesSearch && matchesPosition && matchesDateRange;
  });
});

const sortedReviews = computed(() => {
  return filteredReviews.value.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

onMounted(fetchAllReviews);
</script>

<template>
  <div class="flex justify-end gap-4 px-16 mt-4">
    <RouterLink
      :to="{ path: '/admin/add-review', query: { from: 'user' } }"
      class="bg-gradient-to-b from-button to-button/50 text-white px-4 py-2 rounded-lg shadow-md"
    >
      Add review
    </RouterLink>

    <button
      v-if="showingMyReviews"
      @click="fetchAllReviews"
      class="bg-gradient-to-b from-button to-button/50 text-white px-4 py-2 rounded-lg shadow-md"
    >
      All Reviews
    </button>
    <button
      v-else
      @click="fetchMyReviews"
      class="bg-gradient-to-b from-button to-button/50 text-white px-4 py-2 rounded-lg shadow-md"
    >
      My Reviews
    </button>
  </div>

  <Filter
    class="mt-4"
    @updateSearch="searchKeyword = $event"
    @updatePosition="selectedPosition = $event"
    @updateStartDate="startDate = $event"
    @updateEndDate="endDate = $event"
    :positions="positions"
  />

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-16 mt-8 mb-8">
    <div
      v-for="review in sortedReviews"
      :key="review.id"
      class="border border-border p-4 rounded-lg bg-white shadow"
    >
      <h2 class="text-lg font-bold text-hightlight truncate">{{ review.title }}</h2>
      <p v-if="review.company" class="text-sm font-medium text-gray-600 truncate">{{ review.company }}</p>
      <p v-else-if="review.position" class="text-sm font-medium text-gray-600 truncate">{{ review.position }}</p>
      <p class="text-sm mt-2 text-gray-700 line-clamp-2">{{ review.description.substring(0, 60) }}...</p>
      <small class="text-xs text-gray-400">{{ new Date(review.date).toLocaleDateString('en-GB') }}</small>
      <div class="flex justify-between items-center mt-3">
        <RouterLink
          :to="`/reviews/${review.id}`"
          class="text-xs font-medium text-white bg-gradient-to-b from-button to-button/40 px-4 py-1 rounded-lg border-border border shadow-sm md:text-sm lg:text-base"
        >
          Read more
        </RouterLink>
        <button @click="review.isLikedByUser ? unlikeReview(review) : likeReview(review)">
          <i
  :class="['fas', review.isLikedByUser ? 'fa-heart text-red-500' : 'fa-heart text-gray-400']">
</i>
          <span class="ml-1 text-sm">{{ review.likesCount }}</span>
        </button>
      </div>
    </div>
  </div>

  <div v-if="sortedReviews.length === 0 && !isLoading" class="flex flex-col items-center justify-center py-12">
    <p class="text-gray-500 font-medium">No reviews found</p>
  </div>

  <div v-if="isLoading" class="flex justify-center py-12">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-hightlight"></div>
  </div>
</template>
