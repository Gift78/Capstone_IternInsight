
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import router from '@/router';
import { useRoute } from 'vue-router';
import { AxiosError } from 'axios';

interface Company {
  id: number
  companyName: string
}

interface Post {
  id: number
  title: string
  subtitle: string
  description: string
  position: string[]
  startDate: Date | null
  endDate: Date
  email: string
  tel: string
  company: Company

}

const post = ref<Post | null>(null)
const companies = ref<Company[]>([])
const title = ref('')
const subtitle = ref('')
const companyName = ref('')
const position = ref(<string[]>[])
const description = ref('')
const email = ref('')
const tel = ref('')
const startDate = ref<string | null>(null)
const endDate = ref<string>('')
const companyId = ref<number>(0)

const errorMessages = ref<string[]>([])
const showError = ref(false)

const isLoading = ref(true)
const route = useRoute()
const postId = route.params.id

const profanityPattern = /(อี)?(เหี้ย|ดอก|ห่า|สัส|เวร|ควาย|สัด|ควย)/gi

const removeRepeatedCharacters = (text: string) => {
  return text.replace(/([ก-๙])\1+/g, '$1')
}

const containsProfanity = (text: string) => {
  const cleanedText = removeRepeatedCharacters(text)
  return profanityPattern.test(cleanedText)
}

const handleInput = (event: Event) => {
  const input = event.target as HTMLInputElement | HTMLTextAreaElement
  const cleanedText = removeRepeatedCharacters(input.value)
  if (containsProfanity(cleanedText)) {
    input.value = cleanedText.replace(profanityPattern, "")
    input.setCustomValidity("กรุณาใช้คำที่สุภาพ")
    input.reportValidity()
  } else {
    input.setCustomValidity("")
    input.reportValidity()
  }
}

const validateForm = (): boolean => {
  errorMessages.value = []
  if (containsProfanity(title.value)) {
    errorMessages.value.push('Title contains inappropriate language.')
  }
  if (containsProfanity(description.value)) {
    errorMessages.value.push('Description contains inappropriate language.')
  }
  if (errorMessages.value.length > 0) {
    showError.value = true
    return false
  }
  return true
}

const EditAnnoucement = async () => {
  if (!validateForm()) {
    return
  }
  try {
    const token = localStorage.getItem('token'); // ดึง JWT Token จาก Local Storage
    if (!token) {
      throw new Error('Unauthorized: No token found'); // หากไม่มี Token ให้แจ้งข้อผิดพลาด
    }

    const response = await axios.put(
      `http://localhost:3000/posts/${postId}`,
      {
        title: title.value,
        description: description.value,
        position: position.value,
        startDate: startDate.value,
        endDate: endDate.value,
        email: email.value,
        tel: tel.value,
        subtitle: subtitle.value,
        companyId: companyId.value,
        image: 'default.jpg'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // เพิ่ม JWT Token ใน Header
        },
      }
    );

    console.log('Announcement updated successfully:', response.data);
    router.push('/admin/annouce'); // เปลี่ยนเส้นทางหลังจากแก้ไขสำเร็จ
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      // จัดการข้อผิดพลาดที่เกี่ยวกับ axios
      if (error.response && error.response.data && error.response.data.message) {
        const messages = error.response.data.message;
        console.log('Validation errors:', messages);
        errorMessages.value = messages;
      }
    } else if (error instanceof Error) {
      // จัดการข้อผิดพลาดทั่วไป
      console.error('Error adding announcement:', error.message);
    } else {
      console.error('An unknown error occurred:', error);
    }
  }
};

const closeErrorPopup = () => {
  showError.value = false
}

const selectedImage = ref<File | null>(null)

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (allowedTypes.includes(file.type)) {
      selectedImage.value = file
    } else {
      alert('Only JPG and PNG files are allowed.')
    }
  }
}

const formatstartDate = (date: Date | null): string | null => {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatendDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fetchPostDetail = async () => {
  try {
    const token = localStorage.getItem('token'); // ดึง JWT Token จาก Local Storage
    if (!token) {
      throw new Error('Unauthorized: No token found');
    }

    const response = await axios.get(`http://localhost:3000/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // เพิ่ม JWT Token ใน Header
      },
    });

    const postData = response.data;
    post.value = {
      id: postData.id,
      title: postData.title,
      subtitle: postData.subtitle,
      description: postData.description,
      position: postData.position,
      startDate: postData.startDate ? new Date(postData.startDate) : null,
      endDate: new Date(postData.endDate),
      email: postData.email,
      tel: postData.tel,
      company: {
        id: postData.company.id,
        companyName: postData.company.companyName,
      },
    };

    // ตั้งค่าข้อมูลในฟอร์ม
    title.value = post.value.title;
    description.value = post.value.description;
    subtitle.value = post.value.subtitle;
    position.value = post.value.position;
    startDate.value = formatstartDate(post.value.startDate);
    endDate.value = formatendDate(post.value.endDate);
    email.value = post.value.email;
    tel.value = post.value.tel;
    companyId.value = post.value.company.id;
    companyName.value = post.value.company.companyName;
    search.value = post.value.company.companyName;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      // จัดการข้อผิดพลาดจาก axios
      console.error('Error fetching data:', error.response?.data || error.message);
    } else if (error instanceof Error) {
      // จัดการข้อผิดพลาดทั่วไป
      console.error('Error fetching data:', error.message);
    } else {
      console.error('An unknown error occurred:', error);
    }
  } finally {
    isLoading.value = false;
  }
};

const fetchCompany = async () => {
  try {
    const response = await axios.get<Company[]>('http://localhost:3000/companies')
    companies.value = response.data
  } catch (error) {
    console.error('Error fetching companies:', error)
  }
}

onMounted(() => {
  fetchPostDetail()
  fetchCompany()
})

const search = ref('')
const isOpen = ref(false)
const searchResult = computed(() => {
  if (search.value === '') {
    return []
  }
  const filteredCompanies = companies.value.filter((item) =>
    item.companyName.toLowerCase().includes(search.value.toLowerCase()),
  )

  return filteredCompanies
})

const setSelectedId = (id: number, item: string) => {
  isOpen.value = false
  companyId.value = id
  search.value = item
}

const handleCompanyInput = (event: Event) => {
  isOpen.value = true
  search.value = (event.target as HTMLInputElement).value
}

const formatPhone = (event: Event) => {
  let value = (event.target as HTMLInputElement).value
  value = value.replace(/\D/g, '')
  if (value.length > 3 && value.length <= 6) {
    value = `${value.slice(0, 3)}-${value.slice(3)}`
  } else if (value.length > 6) {
    value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`
  }
  ;(event.target as HTMLInputElement).value = value
}

const positions = [
  'Software Developer',
  'Web Designer',
  'Project Manager',
  'QA Tester',
  'Backend Developer',
  'UX/UI Designer',
  'Business Analyst',
  'Full Stack Developer',
  'Marketing Specialist',
  'Data Science',
  'Devops Developer',
  'Data Analyst',
]

const isDropdownOpen = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}





</script>
<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-center text-2xl font-bold mb-6 text-hightlight">Edit Announce</h1>
    <form @submit.prevent="EditAnnoucement">
      <div class="mb-4">
        <label class="block font-semibold mb-1">Title <span class="text-red-500">*</span></label>
        <input type="text" v-model="title" class="w-full border rounded-lg px-3 py-2" @input="handleInput" />
      </div>
      <div class="mb-4">
        <label>Company <span class="text-red-500">*</span></label>
        <input
          type="text"
          @input="handleCompanyInput"
          v-model="search"
          class="w-full border rounded-lg px-3 py-2"
          required
          placeholder="Select a company."
        />
        <ul v-show="searchResult.length && isOpen" class="border border-border">
          <li
            v-for="(company, index) in searchResult"
            :key="index"
            @click="setSelectedId(company.id, company.companyName)"
            class="cursor-pointer hover:bg-surface p-1"
          >
            {{ company.companyName }}
          </li>
        </ul>
        <ul v-if="searchResult.length === 0 && isOpen" class="border border-border">
          <li class="p-1 text-primary">
            No Company Found. You can
            <a class="text-sm font-bold cursor-pointer underline">Create </a>new Company
          </li>
        </ul>
      </div>

      <!-- Dropdown position-->
      <div class="relative mb-4">
        <label>Position <span class="text-red-500">*</span></label>
        <div
          @click="toggleDropdown"
          class="w-full border rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer"
        >
          <span>{{ position.length > 0 ? position.join(', ') : 'Select Position' }}</span>
          <i class="fa fa-chevron-down"></i>
        </div>

        <div
          v-if="isDropdownOpen"
          class="absolute w-full mt-1 bg-white border rounded shadow-md max-h-64 overflow-y-auto z-10"
        >
          <div
            v-for="pos in positions"
            :key="pos"
            class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer"
          >
            <input
              type="checkbox"
              :value="pos"
              v-model="position"
              class="form-checkbox h-4 w-4 text-blue-600 mr-2"
            />
            <span>{{ pos }}</span>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <label>Subtitle <span class="text-xs text-red-500">(Subtitle should not exceed 255 characters. )</span></label>
        <textarea
          v-model="subtitle"
          class="w-full border rounded-lg px-3 py-2"
          maxlength="255"
          rows="2"
          @input="handleInput"
        ></textarea>
      </div>

      <div class="mb-4">
        <label>Description <span class="text-red-500">*</span></label>
        <textarea
          v-model="description"
          class="w-full border rounded-lg px-3 py-2"
          rows="5"
          @input="handleInput"
        ></textarea>
      </div>
      <div class="mb-4">
        <label>Email <span class="text-red-500">*</span></label>
        <input type="email" v-model="email" class="w-full border rounded-lg px-3 py-2" />
      </div>

      <div class="mb-4">
        <label>Tel <span class="text-red-500">*</span></label>
        <input
          type="text"
          v-model="tel"
          @input="formatPhone"
          class="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div class="flex flex-row justify-start w-full gap-2 *:">
        <div class="mb-4 flex flex-col w-full">
          <label>Start Date</label>
          <input
            type="date"
            v-model="startDate"
            class="mt-1 border rounded-lg px-3 py-2"
          />
        </div>
        <div class="mb-4 flex flex-col w-full">
          <label>End Date <span class="text-red-500">*</span></label>
          <input
            type="date"
            v-model="endDate"
            class="mt-1 border rounded-lg px-3 py-2"
            :min="startDate ? startDate : undefined"
            required
          />
        </div>
      </div>


      <div class="mb-4">
  <label>Upload Image</label>
  <input type="file" @change="handleFileUpload" accept="image/*" class="w-full border rounded-lg px-3 py-2" />
</div>


      <div class="flex justify-center space-x-4 mt-4">
        <RouterLink
          to="/admin/annouce"
          type="button"
          class="text-white text-xs font-bold bg-gradient-to-b from-button px-4 py-1.5 h-fit to-button/55 shadow-md rounded-lg lg:text-sm"
        >
          Cancel
        </RouterLink>
        <button
          type="submit"
          class="text-white text-xs font-bold bg-gradient-to-b from-button px-4 py-1.5 h-fit to-button/55 shadow-md rounded-lg lg:text-sm"
        >
          Submit
        </button>
      </div>
    </form>
  </div>

  <div
    v-if="showError && errorMessages.length > 0"
    class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
  >
    <div class="bg-white p-6 rounded-lg w-80">
      <h3 class="text-lg font-bold mb-4">
        <ul>
          <li v-for="(message, index) in errorMessages" :key="index">
            {{ message }}
          </li>
        </ul>
      </h3>
      <div class="flex justify-between gap-4">
        <button @click="closeErrorPopup" class="w-full bg-red-600 text-white py-2 rounded-md">
          Ok
        </button>
      </div>
    </div>
  </div>
</template>
