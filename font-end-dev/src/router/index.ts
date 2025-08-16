import { createRouter, createWebHistory } from 'vue-router'
import PostView from '../views/PostView.vue'
import ReviewView from '../views/ReviewView.vue'
import QuestionView from '@/views/QuestionView.vue'
import PostDetail from '../views/PostDetail.vue'
import ReviewDetail from '../views/ReviewDetail.vue'
import QuestionDetail from '@/views/QuestionDetail.vue'
import AdminView from '@/views/admin/AdminView.vue'
import AddAnnouce from '@/views/admin/AddAnnouce.vue'
import EditAnnouce from '@/views/admin/EditAnnouce.vue'
import AnnouceView from '@/views/admin/AnnouceView.vue'
import DetailAnnouce from '@/views/admin/DetailAnnouce.vue'
import LoginView from '@/views/LoginView.vue'
import AdminQuestion from '@/views/admin/AdminQuestion.vue'
import AdminReview from '@/views/admin/AdminReview.vue'
import AddReview from '@/views/admin/AddReview.vue'
import AddQuestion from '@/views/admin/AddQuestion.vue'
import DetailReview from '@/views/admin/DetailReview.vue'
import EditQuestion from '@/views/admin/EditQuestion.vue'
import EditReview from '@/views/admin/EditReview.vue'
import DetailQuestion from '@/views/admin/DetailQuestion.vue'
import HomeView from '@/views/HomeView.vue'
import EditProfile from '../views/EditProfile.vue'
import ViewUserProfile from '../views/ViewUserProfile.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import RegisterPage from '@/views/RegisterPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      redirect: 'posts',
      children: [
        {
          path: 'posts',
          name: 'posts',
          component: PostView,
        },
        {
          path: 'posts/:id',
          name: 'post details',
          component: PostDetail,
        },
        {
          path: 'reviews',
          name: 'reviews',
          component: ReviewView,
        },
        {
          path: 'reviews/:id',
          name: 'review detail',
          component: ReviewDetail,
        },
        {
          path: 'questions',
          name: 'questions',
          component: QuestionView,
        },
        {
          path: 'questions/:id',
          name: 'question details',
          component: QuestionDetail,
        },
      ],
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      redirect: '/admin/annouce',
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: 'annouce',
          name: 'annouce',
          component: AnnouceView,
        },
        {
          path: 'annouce/:id',
          name: 'annouce details',
          component: DetailAnnouce,
        },
        {
          path: 'review/:id',
          name: 'review details',
          component: DetailReview,
        },
        {
          path: 'question/:id',
          name: 'detail question',
          component: DetailQuestion,
        },
      ],
    },
    {
      path: '/admin/add-annouce',
      name: 'add annouce',
      component: AddAnnouce,
    },
    {
      path: '/admin/edit-annouce/:id',
      name: 'edit annouce',
      component: EditAnnouce,
    },
    {
      path: '/admin/review',
      name: 'admin review',
      component: AdminReview,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/add-review',
      name: 'add review',
      component: AddReview,
    },
    {
      path: '/admin/edit-review/:id',
      name: 'edit review',
      component: EditReview,
    },
    {
      path: '/edit-review/:id',
      name: 'edit review(user)',
      component: EditReview,
    },
    {
      path: '/admin/question',
      name: 'admin question',
      component: AdminQuestion,
      meta: { requiresAuth: true, role: 'admin' },
    },
    {
      path: '/admin/add-question',
      name: 'add question',
      component: AddQuestion,
    },
    {
      path: '/admin/edit-question/:id',
      name: 'edit question',
      component: EditQuestion,
    },
    {
      path: '/edit-question/:id',
      name: 'edit question (user)',
      component: EditQuestion,
    },

    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
    },
    {
      path: '/edit-profile',
      name: 'edit profile',
      component: EditProfile,
    },
    {
      path: '/users/:id',
      name: 'ViewUserProfile',
      component: ViewUserProfile,
    },
    {
      path: '/ForgotPassword',
      name: 'ForgotPassword',
      component: ForgotPassword,
    },
  ],
})

export default router
