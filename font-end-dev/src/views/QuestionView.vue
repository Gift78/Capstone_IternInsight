<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import axios from 'axios';
import Filter from '../components/FilterComp.vue';

interface Question {
  id: number;
  title: string;
  position?: string;
  description: string;
  date: Date;
  company?: string;
  userName?: string;
  likes?: unknown[];
  isLikedByUser?: boolean;
  likesCount?: number;
}

const questions = ref<Question[]>([]);
const isLoading = ref(true);
const router = useRouter();
const searchKeyword = ref('');
const selectedPosition = ref('');
const startDate = ref('');
const endDate = ref('');
const showingMyQuestions = ref(false);
const user = JSON.parse(localStorage.getItem('user') || 'null');

const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch {
    return false;
  }
};

if (!isTokenValid()) {
  alert('Session expired. Please log in again.');
  localStorage.removeItem('token');
  router.push('/login');
}

interface RawLike {
  user?: { id: number };
}

interface RawQuestion {
  id: number;
  title: string;
  description: string;
  date: string;
  like?: RawLike[];
  [key: string]: unknown;
}

const transformQuestion = (q: RawQuestion): Question => {
  const liked = q.like?.some((l: RawLike) => l.user?.id === user?.id) ?? false;
  return {
    ...q,
    isLikedByUser: liked,
    likesCount: q.like?.length || 0,
    date: new Date(q.date),
  };
};

const fetchAllQuestions = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Unauthorized: No token found');

    const response = await axios.get('http://localhost:3000/questions', {
      headers: { Authorization: `Bearer ${token}` },
    });

    questions.value = response.data.map(transformQuestion);
    showingMyQuestions.value = false;
  } catch (error) {
    console.error('Error fetching data', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchMyQuestions = async () => {
  try {
    isLoading.value = true;
    const token = localStorage.getItem('token');
    const userId = user?.id;
    if (!token || !userId) throw new Error('Unauthorized');

    const response = await axios.get(`http://localhost:3000/questions/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    questions.value = response.data.map(transformQuestion);
    showingMyQuestions.value = true;
  } catch (error) {
    console.error('Error fetching my questions:', error);
  } finally {
    isLoading.value = false;
  }
  console.log('Current user:', user);
  console.log('User ID used to fetch:', user?.id);
  if (!user || !user.id) {
    alert('User ID not found. Please log in again.');
    return;
  }


};

const likeQuestion = async (q: Question) => {
  const token = localStorage.getItem('token');
  q.isLikedByUser = true;
  q.likesCount = (q.likesCount || 0) + 1;
  try {
    await axios.post(`http://localhost:3000/questions/${q.id}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (e) {
    q.isLikedByUser = false;
    q.likesCount = (q.likesCount || 1) - 1;
    console.error('Like failed', e);
  }
};

const unlikeQuestion = async (q: Question) => {
  const token = localStorage.getItem('token');
  q.isLikedByUser = false;
  q.likesCount = Math.max((q.likesCount || 1) - 1, 0);
  try {
    // Since DELETE /unlike doesn't exist, fallback to same like endpoint to toggle like
    await axios.post(`http://localhost:3000/questions/${q.id}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (e) {
    q.isLikedByUser = true;
    q.likesCount = (q.likesCount || 0) + 1;
    console.error('Unlike fallback failed', e);
  }
};

const positions = computed(() => {
  const uniquePositions = new Set(questions.value.map((question) => question.position).filter(Boolean));
  return Array.from(uniquePositions) as string[];
});

const filteredQuestions = computed(() => {
  return questions.value.filter((question) => {
    const matchesSearch =
      question.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      question.description.toLowerCase().includes(searchKeyword.value.toLowerCase());

    const matchesPosition = !selectedPosition.value || question.position === selectedPosition.value;

    const questionDate = new Date(question.date);
    const matchesDateRange =
      (!startDate.value || questionDate >= new Date(startDate.value)) &&
      (!endDate.value || questionDate <= new Date(endDate.value));

    return matchesSearch && matchesPosition && matchesDateRange;
  });
});

const sortedQuestions = computed(() => {
  return filteredQuestions.value.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});


onMounted(fetchAllQuestions);
</script>


<template>
  <div class="flex justify-end gap-4 px-16 mt-4">
    <RouterLink :to="{ path: '/admin/add-question', query: { from: 'user' } }"
      class="bg-gradient-to-b from-button to-button/50 text-white px-4 py-2 rounded-lg shadow-md">
      Add Question
    </RouterLink>

    <button v-if="showingMyQuestions" @click="fetchAllQuestions"
      class="bg-gradient-to-b from-button to-button/50 text-white px-4 py-2 rounded-lg shadow-md">
      All Questions
    </button>
    <button v-else @click="fetchMyQuestions"
      class="bg-gradient-to-b from-button to-button/50 text-white px-4 py-2 rounded-lg shadow-md">
      My Questions
    </button>
  </div>

  <Filter class="mt-4" @updateSearch="searchKeyword = $event" @updatePosition="selectedPosition = $event"
    @updateStartDate="startDate = $event" @updateEndDate="endDate = $event" :positions="positions" />

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-16 mt-8 mb-8">
    <div v-for="question in sortedQuestions" :key="question.id"
      class="border border-border p-4 rounded-lg bg-white shadow">
      <h2 class="text-lg font-bold text-hightlight truncate">{{ question.title }}</h2>
      <p class="text-sm mt-2 text-gray-700 line-clamp-2">{{ question.description.substring(0, 60) }}...</p>
      <small class="text-xs text-gray-400">{{ new Date(question.date).toLocaleDateString('en-GB') }}</small>
      <div class="flex justify-between items-center mt-3">
        <RouterLink :to="`/questions/${question.id}`"
          class="text-xs font-medium text-white bg-gradient-to-b from-button to-button/40 px-4 py-1 rounded-lg border-border border shadow-sm md:text-sm lg:text-base">
          Read more
        </RouterLink>
        <button @click="question.isLikedByUser ? unlikeQuestion(question) : likeQuestion(question)">
          <i :class="['fas', question.isLikedByUser ? 'fa-heart text-red-500' : 'fa-heart text-gray-400']"></i>
          <span class="ml-1 text-sm">{{ question.likesCount }}</span>
        </button>
      </div>
    </div>
  </div>

  <div v-if="sortedQuestions.length === 0 && !isLoading" class="flex flex-col items-center justify-center py-12">
    <p class="text-gray-500 font-medium">No questions found</p>
  </div>

  <div v-if="isLoading" class="flex justify-center py-12">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-highlight"></div>
  </div>


</template>

<style scoped></style>
