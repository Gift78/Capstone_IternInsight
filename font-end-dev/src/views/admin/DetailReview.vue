<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';


const route = useRoute();
const router = useRouter();

const isLoading = ref<boolean>(true);

interface Review {
  id: number;
  title: string;
  description: string;
  date: string;  // สามารถปรับให้เป็น Date ถ้าต้องการ
  created_at?: string;
  updated_at?: string;
  like?: unknown[];
}

// กำหนดประเภทให้กับ comment
interface Comment {
  id: number;
  user: {
    id: number;
    name: string;
  };
  text: string;
  date: string;  // สามารถปรับให้เป็น Date ถ้าต้องการ
}

const review = ref<Review | null>(null);  // กำหนดประเภทเป็น Review หรือ null
const comments = ref<Comment[]>([]);
const commentText = ref<string>('');
const showModal = ref<boolean>(false);
const deleteId = ref<number | null>(null);
const deleteTitle = ref<string>('');
const editCommentId = ref<number | null>(null);
const editText = ref<string>('');
const deleteCommentId = ref<number | null>(null);
const showCommentDelete = ref<boolean>(false);
const id = Number(route.params.id);

const likeCount = computed<number>(() => review.value?.like?.length || 0);

const user = ref<{ id?: number; name?: string; role?: string }>({});
const storedUser = localStorage.getItem('user');
if (storedUser) {
  user.value = JSON.parse(storedUser);
  user.value.name = 'Admin';  // Override name to 'Admin'
  localStorage.setItem('user', JSON.stringify(user.value));
}

// Fetch review data
const fetchReview = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`http://localhost:3000/reviews/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    review.value = response.data;
  } catch (err) {
    console.error('Error fetching review:', err);
  } finally {
    isLoading.value = false;  // ตั้งค่า isLoading เป็น false เมื่อโหลดเสร็จ
  }
};

// Fetch comments data
const fetchComments = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/reviews/${id}/comment`);
    comments.value = Array.isArray(res.data.comments) ? res.data.comments.reverse() : [];
  } catch (err) {
    console.error('Error fetching comments:', err);
  } finally {
    isLoading.value = false;  // ตั้งค่า isLoading เป็น false เมื่อโหลดเสร็จ
  }
};

// Submit new comment
const submitComment = async () => {
  if (!user.value?.id) {
    console.error('User is not logged in or does not have an ID');
    return;
  }

  const token = localStorage.getItem('token');
  const now = new Date();

  try {
    const res = await axios.post(`http://localhost:3000/reviews/${id}/comment`, {
      text: commentText.value,
      date: now,
      user: user.value.id,
      review: id,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 201 || res.status === 200) {
      commentText.value = '';
      await fetchComments();
    }
  } catch (err) {
    console.error('Error submitting comment:', err);
  }
};

// Edit comment functionality
const startEditComment = (comment: Comment) => {
  editCommentId.value = comment.id;
  editText.value = comment.text;
};

// Cancel editing comment
const cancelEditComment = () => {
  editCommentId.value = null;
  editText.value = '';
};

// Save edited comment
const saveCommentEdit = async () => {
  const token = localStorage.getItem('token');
  try {
    await axios.put(`http://localhost:3000/reviews/${id}/comment/${editCommentId.value}`, {
      text: editText.value,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    cancelEditComment();
    await fetchComments();
  } catch (err) {
    console.error('Error saving edited comment:', err);
  }
};

// Confirm delete comment
const confirmDeleteComment = (id: number) => {
  deleteCommentId.value = id;
  showCommentDelete.value = true;
};

// Delete comment
const deleteComment = async () => {
  const token = localStorage.getItem('token');
  try {
    await axios.delete(`http://localhost:3000/reviews/${id}/comment/${deleteCommentId.value}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    showCommentDelete.value = false;
    await fetchComments();
  } catch (err) {
    console.error('Error deleting comment:', err);
  }
};

// Cancel delete comment
const cancelDeleteComment = () => {
  showCommentDelete.value = false;
};

// Confirm delete review
const confirmDelete = (id: number, title: string) => {
  deleteId.value = id;
  deleteTitle.value = title;
  showModal.value = true;
};

// Delete review
const handleDeleteReview = async () => {
  const token = localStorage.getItem('token');
  try {
    await axios.delete(`http://localhost:3000/reviews/${deleteId.value}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    showModal.value = false;

    if (user.value.role === 'admin') {
      router.push('/admin/review');
    } else {
      router.push('/reviews');
    }
  } catch (err) {
    console.error('Error deleting review:', err);
  }
};

// Cancel delete review
const cancelDeleteReview = () => {
  showModal.value = false;
};

// Format date
const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleString();
};

onMounted(() => {
  fetchReview();
  fetchComments();
});
</script>


<template>
  <div class="font-Prompt flex flex-col w-full space-y-2 p-2 sm:px-12 md:px-16 lg:px-32 lg:py-4 xl:px-56 2xl:px-96">
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-left text-2xl font-bold text-hightlight">Review</h1>
      <div class="text-sm text-gray-500 whitespace-nowrap">
        {{ likeCount }} Like {{ comments.length }} Comments
      </div>
    </div>

    <div v-if="isLoading" class="text-center text-gray-500 text-lg">Loading...</div>

    <!-- Display the review details -->
    <div v-else-if="review" class="flex flex-col border border-border rounded-lg p-6 gap-2 bg-white shadow-lg">
      <div class="mb-4">
        <h2 class="text-2xl font-extrabold">{{ review.title || 'No title available' }}</h2>
      </div>
      <p v-if="review.description" class="text-md leading-relaxed text-gray-700 mb-4">{{ review.description }}</p>
      <p class="text-sm text-gray-500">Date: {{ formatDate(review.date) }}</p>
      <p v-if="review.created_at" class="text-sm text-gray-500">
        Created at: {{ formatDate(review.created_at) }}
      </p>
      <p v-if="review.updated_at" class="text-sm text-gray-500">
        Updated at: {{ formatDate(review.updated_at) }}
      </p>

      <div class="flex gap-4 justify-end items-center">
        <!-- Admin buttons to edit and delete review -->
        <router-link :to="{ path: `/admin/edit-review/${review.id}`, query: { from: 'admin'} }" class="text-hightlight hover:underline">
          <i class="fas fa-edit"></i>
        </router-link>
        <button @click="confirmDelete(review.id, review.title)" class="text-hightlight hover:underline">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <!-- Error message if review not found -->
    <div v-else class="text-center text-red-500 text-lg">Review not found.</div>

    <!-- Modal to confirm review deletion -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div class="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h3 class="text-lg font-bold mb-6 text-center">
          ⚠️ Are you sure you want to delete this review
          <span class="text-red-600">[ {{ deleteTitle }} ]</span>?
        </h3>
        <div class="flex justify-center gap-6">
          <button @click="handleDeleteReview" class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Confirm</button>
          <button @click="cancelDeleteReview" class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Comment section -->
    <h3 class="text-2xl font-semibold mb-2 text-hightlight">Comment</h3>

    <!-- Comment form -->
    <form @submit.prevent="submitComment" class="bg-white shadow rounded-lg p-4 mt-4 border border-gray-300">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold uppercase text-xl">
          {{ user?.name?.charAt(0) || '?' }}
        </div>
        <div>
          <strong class="text-xl">{{ user?.name || 'Unknown' }}</strong>
        </div>
      </div>

      <div class="flex items-center border rounded-xl bg-gray-100 p-2 pr-3 ml-12">
        <textarea
          v-model="commentText"
          placeholder="Comment ..."
          class="flex-1 bg-transparent outline-none px-3 resize-none"
          rows="1"
        ></textarea>

        <!-- Submit button -->
        <button type="submit" :disabled="!commentText.trim()">
          <svg :class="['w-5 h-5', commentText.trim() ? 'text-blue-600' : 'text-gray-400']" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.4 20.4l17.3-8.7c.5-.2.5-.9 0-1.1L3.4 2c-.5-.2-1 .2-1 .8v6.3c0 .3.2.5.5.6l11.2 2.3L2.9 14.4c-.3.1-.5.3-.5.6v6.2c0 .6.5 1 1 0.8z" />
          </svg>
        </button>
      </div>
    </form>

    <!-- Displaying comments -->
    <div v-for="cmt in comments" :key="cmt.id" class="mb-4 border rounded-lg p-4">
      <div class="flex justify-between items-start mb-1">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold uppercase">
            {{ cmt.user?.name?.charAt(0) || '?' }}
          </div>
          <div>
            <strong class="text-xl">{{ cmt.user?.name || 'Unknown' }}</strong>
            <div class="text-sm text-gray-400">{{ formatDate(cmt.date) }}</div>
          </div>
        </div>

        <!-- Admin options to edit or delete comment -->
        <div v-if="user && user.role === 'admin'" class="flex gap-2 text-sm text-hightlight">
          <button @click="startEditComment(cmt)"><i class="fas fa-pen"></i></button>
          <button @click="confirmDeleteComment(cmt.id)"><i class="fas fa-trash"></i></button>
        </div>
      </div>

      <!-- Edit comment -->
      <div v-if="editCommentId === cmt.id">
        <textarea v-model="editText" class="w-full border rounded-md p-2 resize-none mb-2"></textarea>
        <div class="flex gap-2 justify-end">
          <button @click="saveCommentEdit" class="text-white text-xs font-bold bg-gradient-to-b from-button px-4 py-1.5 h-fit to-button/55 shadow-md rounded-lg lg:text-sm">Save</button>
          <button @click="cancelEditComment" class="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500">Cancel</button>
        </div>
      </div>

      <!-- Display comment text -->
      <p v-else class="text-base mt-1 ml-12">{{ cmt.text || '(no content)' }}</p>
    </div>

    <!-- Modal to confirm comment deletion -->
    <div v-if="showCommentDelete" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div class="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h3 class="text-lg font-bold mb-6 text-center">
          ⚠️ Are you sure you want to delete this comment?
        </h3>
        <div class="flex justify-center gap-6">
          <button @click="deleteComment" class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Confirm</button>
          <button @click="cancelDeleteComment" class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
