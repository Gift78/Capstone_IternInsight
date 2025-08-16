<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import HoverPopup from '@/components/HoverPopup.vue';

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

interface Comment {
  id: number;
  text: string;
  user: User;
  date: string;
}

interface Review {
  id: number;
  title: string;
  description: string;
  date: string;
  user: User;
  like: unknown[];
}

const route = useRoute();
const router = useRouter();
const fullPath = computed(() => route.fullPath)

const review = ref<Review | null>(null);
const comments = ref<Comment[]>([]);
const commentText = ref('');
const user = ref<User | null>(null);
const showModal = ref(false);
const deleteId = ref<number | null>(null);
const deleteTitle = ref('');
const editCommentId = ref<number | null>(null);
const editText = ref('');
const deleteCommentId = ref<number | null>(null);
const showCommentDelete = ref(false);
const likeCount = computed(() => review.value?.like?.length || 0);
const hoveredUserId = ref<number | null>(null);

const id = Number(route.params.id);
const from = route.query.from || 'user';

const fetchReview = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:3000/reviews/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    review.value = response.data || null;
  } catch (err) {
    console.error('Error loading question:', err);
  }
};

const fetchComments = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/reviews/${id}/comment`);
    comments.value = Array.isArray(res.data.comments) ? res.data.comments.reverse() : [];
  } catch (err) {
    console.error('Error fetching comments:', err);
  }
};

onMounted(() => {
  const stored = localStorage.getItem('user');
  if (stored) user.value = JSON.parse(stored);
  fetchReview();
  fetchComments();
});

const submitComment = async () => {
  const token = localStorage.getItem('token');
  const now = new Date();

  try {
    const res = await axios.post(
      `http://localhost:3000/reviews/${id}/comment`,
      {
        text: commentText.value,
        date: now,
        user: user.value?.id,
        review: id,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if ([200, 201].includes(res.status)) {
      // สมมติ backend ส่งกลับ { comment: {...} }
      const createdComment = res.data.comment || res.data;

      comments.value.unshift({
        id: createdComment.id,
        text: createdComment.text,
        date: new Date(createdComment.date).toISOString(),
        user: createdComment.user || user.value!,
      });

      commentText.value = '';
    }
  } catch (err) {
    console.error('Error submitting comment:', err);
  }
};


const startEditComment = (comment: Comment) => {
  editCommentId.value = comment.id;
  editText.value = comment.text;
};

const cancelEditComment = () => {
  editCommentId.value = null;
  editText.value = '';
};

const saveCommentEdit = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(`http://localhost:3000/reviews/${id}/comment/${editCommentId.value}`,
      { text: editText.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    cancelEditComment();
    await fetchComments();
  } catch (err) {
    console.error('Error editing comment:', err);
  }
};

const confirmDeleteComment = (id: number) => {
  deleteCommentId.value = id;
  showCommentDelete.value = true;
};

const deleteComment = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:3000/reviews/${id}/comment/${deleteCommentId.value}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    showCommentDelete.value = false;
    await fetchComments();
  } catch (err) {
    console.error('Error deleting comment:', err);
  }
};

const cancelDeleteComment = () => {
  showCommentDelete.value = false;
};

const confirmDelete = (qid: number, title: string) => {
  deleteId.value = qid;
  deleteTitle.value = title;
  showModal.value = true;
};

const handleDelete = async () => {
  if (!deleteId.value) return
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:3000/reviews/${deleteId.value}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    showModal.value = false;
    redirectBack();
  } catch (err) {
    console.error('Error deleting question:', err);
    showModal.value = false;
  }
};

const redirectBack = () => {
  router.push(from === 'admin' ? '/admin/question' : '/questions');
};

const cancelDelete = () => {
  showModal.value = false;
  deleteId.value = null;
  deleteTitle.value = '';
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleString();
};

onMounted(() => {
  fetchReview();
  fetchComments();
});

const isValidImage = (img?: string): boolean => {
  const trimmed = img?.trim().toLowerCase();
  return !!(trimmed && trimmed !== 'null' && trimmed !== 'undefined' && trimmed !== 'default.jpg');
};

// profileImageUrl receive user.image from localStorage

const profileImageUrl = computed(() => {
  if (!user.value || !isValidImage(user.value.image)) return null;

  const image = user.value.image;
  return image.startsWith('http')
    ? image
    : `http://localhost:9000/iterninsight/${image}?t=${Date.now()}`;
});

</script>

<style scoped></style>


<template>
  <div class="font-Prompt flex flex-col w-full space-y-2 p-2 sm:px-12 md:px-16 lg:px-32 lg:py-4 xl:px-56 2xl:px-96">
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-left text-2xl font-bold text-hightlight">Review Detail</h1>
      <div class="text-sm text-gray-500 whitespace-nowrap">
        {{ likeCount }} Like {{ comments.length }} Comments
      </div>
    </div>

    <div v-if="review" class="flex flex-col border border-border rounded-lg p-6 gap-2 bg-white shadow-lg">
      <div class="mb-4">
        <h2 class="text-2xl font-extrabold">{{ review.title || 'No title available' }}</h2>
      </div>
      <p v-if="review.description" class="text-md text-gray-700 mb-4">{{ review.description }}</p>
      <div class="text-sm text-gray-500">Date: {{ new Date(review.date).toLocaleDateString('en-GB') }}</div>
      <div v-if="user && user.id === review.user?.id" class="flex gap-4 justify-end items-center">
        <router-link
          :to="{ path: from === 'admin' ? '/admin/edit-review/' + review.id : '/edit-review/' + review.id, query: { from } }"
          class="text-hightlight hover:underline">
          <i class="fas fa-edit"></i>
        </router-link>
        <button @click="confirmDelete(review.id, review.title)" class="text-hightlight hover:underline">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <!-- Comment section -->
    <h3 class="text-2xl font-semibold mb-2 text-hightlight">Comment</h3>

    <!-- Comment input and send button -->
    <div v-if="user" class="bg-white shadow rounded-lg p-4 mt-4 border border-gray-300">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-10 h-10 rounded-full overflow-hidden">
          <div v-if="profileImageUrl" class="w-full h-full">
            <img :src="profileImageUrl" alt="Profile" class="w-full h-full object-cover rounded-full" />
          </div>
          <div v-else
            class="bg-[#00465e] w-full h-full flex items-center justify-center text-white font-bold text-lg uppercase">
            {{ user?.name?.charAt(0).toUpperCase() || '?' }}
          </div>
        </div>
        <div>
          <strong class="text-xl font-bold text-hightlight">{{ user?.name || 'Unknown' }}</strong>
        </div>
      </div>
      <div class="flex items-center border rounded-xl bg-gray-100 p-2 pr-3 ml-12">
        <textarea v-model="commentText" placeholder="Comment ..."
          class="flex-1 bg-transparent outline-none px-3 resize-none" rows="1"></textarea>
        <button @click="submitComment" :disabled="!commentText.trim()">
          <svg :class="['w-5 h-5', commentText.trim() ? 'text-blue-600' : 'text-gray-400']" fill="currentColor"
            viewBox="0 0 24 24">
            <path
              d="M3.4 20.4l17.3-8.7c.5-.2.5-.9 0-1.1L3.4 2c-.5-.2-1 .2-1 .8v6.3c0 .3.2.5.5.6l11.2 2.3L2.9 14.4c-.3.1-.5.3-.5.6v6.2c0 .6.5 1 1 0.8z" />
          </svg>
        </button>
      </div>
    </div>

    <div v-for="cmt in comments" :key="cmt.id" class="mb-4 border rounded-lg p-4 ">
      <div class="flex justify-between items-start mb-1">
        <!-- Commenter Info + Hover Popup -->
        <div v-if="cmt.user" class="relative inline-block" @mouseenter="hoveredUserId = cmt.user.id"
          @mouseleave="hoveredUserId = null">
          <router-link v-if="cmt.user" :to="{ path: `/users/${cmt.user.id}`, query: { from: fullPath } }"
            class="flex items-center gap-2 group">
            <div class="w-10 h-10 rounded-full flex items-center justify-center border overflow-hidden">
              <template v-if="isValidImage(cmt.user?.image)">
                <img :src="cmt.user.image.startsWith('http')
                  ? cmt.user.image
                  : `http://localhost:9000/iterninsight/${cmt.user.image}`
                  " alt="Profile" class="w-10 h-10 rounded-full object-cover border" />
              </template>
              <template v-else>
                <div
                  class="w-10 h-10 rounded-full bg-[#00465e] text-white flex items-center justify-center text-xl font-bold">
                  {{ cmt.user?.name?.charAt(0).toUpperCase() || '?' }}
                </div>
              </template>
            </div>
            <div>
              <strong class="text-xl font-bold text-hightlight group-hover:underline">
                {{ cmt.user?.name || 'Unknown' }}
              </strong>
              <div class="text-sm text-gray-400">
                {{ formatDate(cmt.date) }}
              </div>
            </div>
          </router-link>

          <!-- ✅ Popup only on hover -->
          <HoverPopup v-if="hoveredUserId === cmt.user.id" :user="cmt.user" class="absolute top-full left-0 z-50" />
        </div>



        <div v-if="user && user.id === cmt.user?.id" class="flex gap-2 text-sm text-gray-500">
          <button @click="startEditComment(cmt)"><i class="fas fa-pen"></i></button>
          <button @click="confirmDeleteComment(cmt.id)"><i class="fas fa-trash"></i></button>
        </div>
      </div>

      <div v-if="editCommentId === cmt.id">
        <textarea v-model="editText" class="w-full border rounded-md p-2 resize-none mb-2"></textarea>
        <div class="flex gap-2 justify-end">
          <button @click="saveCommentEdit"
            :disabled="editText.trim() === comments.find(c => c.id === editCommentId)?.text.trim()" :class="[
              'text-white text-xs font-bold px-4 py-1.5 h-fit shadow-md rounded-lg lg:text-sm',
              editText.trim() === comments.find(c => c.id === editCommentId)?.text.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-b from-button to-button/55'
            ]">
            Save
          </button>
          <button @click="cancelEditComment"
            class="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500">Cancel</button>
        </div>
      </div>
      <p v-else class="text-base mt-1 ml-12">{{ cmt.text || '(no content)' }}</p>
    </div>

    <!-- Confirm delete modal for post -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div class="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h3 class="text-lg font-bold mb-6 text-center">
          ⚠️ Are you sure you want to delete this review <span class="text-red-600">[ {{ deleteTitle }} ]</span>?
        </h3>
        <div class="flex justify-center gap-6">
          <button @click="handleDelete"
            class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Confirm</button>
          <button @click="cancelDelete"
            class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Confirm delete modal for comment -->
    <div v-if="showCommentDelete" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div class="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h3 class="text-lg font-bold mb-6 text-center">
          ⚠️ Delete this comment?
        </h3>
        <div class="flex justify-center gap-6">
          <button @click="deleteComment"
            class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Confirm</button>
          <button @click="cancelDeleteComment"
            class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
