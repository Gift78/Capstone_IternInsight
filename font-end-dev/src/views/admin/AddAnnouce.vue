<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

interface Company {
  id: number
  companyName: string
}

// Admin ID (you can adjust this as needed)
const adminId = 1 // Replace with actual admin ID

// Ref to bind form data
const companies = ref<Company[]>([])
const isLoading = ref(true) // loading state
const title = ref('')
const subtitle = ref('')
const description = ref('')
const position = ref<string[]>([]) // Adjusted type to string[]
const startDate = ref(new Date()) // Corrected initialization of startDate
const email = ref('')
const tel = ref('')
const endDate = ref(new Date()) // Corrected initialization of endDate
const companyId = ref(1)
const router = useRouter()

// รายการตำแหน่งงานที่สามารถเลือกได้
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

// Variables to manage dropdown functionality
const isDropdownOpen = ref(false)

// Function to toggle dropdown visibility
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}
const errorMessages = ref<string[]>([])
const showError = ref(false)

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

const validateForm = () => {
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

// Function to handle form submission
const addAnnouncement = async () => {
  try {
    const token = localStorage.getItem('token'); // ดึง JWT Token จาก Local Storage
    if (!token) {
      throw new Error('Unauthorized: No token found');
    }

    const response = await axios.post(
      'http://localhost:3000/posts',
      {
        title: title.value,
        subtitle: subtitle.value,
        description: description.value,
        position: position.value,
        email: email.value,
        tel: tel.value,
        startDate: startDate.value,
        endDate: endDate.value,
        adminId,
        companyId: companyId.value,
        image: 'default.jpg'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // เพิ่ม JWT Token ใน Header
        },
      }
    );

    router.push('/admin/annouce');
    console.log('Announcement added successfully:', response.data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      // ตอนนี้คุณสามารถเข้าถึง error.message ได้อย่างปลอดภัย
      console.error('Error adding announcement:', error.message);
    } else {
      // หาก error ไม่ใช่ instance ของ Error ให้แสดงข้อความที่เป็นประเภท unknown
      console.error('Unknown error:', error);
    }
  }
};


const submitForm = () => {
  if (validateForm()) {
    addAnnouncement()
  }
}

const fetchData = async () => {
  try {
    const response = await axios.get<Company[]>('http://localhost:3000/companies')
    companies.value = response.data.map((company) => ({
      id: company.id,
      companyName: company.companyName,
    }))
  } catch (error) {
    console.error('Error fetching data', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)

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
  value = value.replace(/\D/g, '') // Remove non-digit characters
  if (value.length > 3 && value.length <= 6) {
    value = `${value.slice(0, 3)}-${value.slice(3)}`
  } else if (value.length > 6) {
    value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`
  }
  ; (event.target as HTMLInputElement).value = value
}

const closeErrorPopup = () => {
  showError.value = false
}

// Function to log selected dates
const logDates = () => {
  console.log('Start Date:', startDate.value);
  console.log('End Date:', endDate.value);
}

// const selectedImage = ref<File | null>(null)

// const handleFileUpload = (event: Event) => {
//   const target = event.target as HTMLInputElement
//   if (target.files && target.files.length > 0) {
//     const file = target.files[0]
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
//     if (allowedTypes.includes(file.type)) {
//       selectedImage.value = file
//     } else {
//       alert('Only JPG and PNG files are allowed.')
//     }
//   }
// }


</script>

<template>
  <div class="max-w-4xl mx-auto p-4 font-Prompt">
    <h1 class="text-center text-2xl font-bold mb-6 text-hightlight">Add Announce</h1>
    <form @submit.prevent="submitForm">
      <div class="mb-4">
        <label class="block font-semibold mb-1">Title <span class="text-red-500">*</span></label>
        <input type="text" v-model="title" @input="handleInput" class="w-full border rounded-lg px-3 py-2" required />
      </div>
      <div class="mb-4">
        <label>Company <span class="text-red-500">*</span></label>
        <input type="text" @input="handleCompanyInput" v-model="search" class="w-full border rounded-lg px-3 py-2"
          required placeholder="Select a company." />
        <ul v-show="searchResult.length && isOpen" class="border border-border">
          <li v-for="(company, index) in searchResult" :key="index"
            @click="setSelectedId(company.id, company.companyName)" class="cursor-pointer hover:bg-surface p-1">
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

      <!-- Dropdown Custom สำหรับเลือกตำแหน่งงาน -->
      <div class="relative mb-4">
        <label>Position <span class="text-red-500">*</span></label>
        <div @click="toggleDropdown"
          class="w-full border rounded-lg px-3 py-2 flex justify-between items-center cursor-pointer">
          <span>{{ position.length > 0 ? position.join(', ') : 'Select Position' }}</span>
          <i class="fa fa-chevron-down"></i>
        </div>

        <div v-if="isDropdownOpen"
          class="absolute w-full mt-1 bg-white border rounded shadow-md max-h-64 overflow-y-auto z-10">
          <div v-for="pos in positions" :key="pos" class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer">
            <input type="checkbox" :value="pos" v-model="position" class="form-checkbox h-4 w-4 text-blue-600 mr-2" />
            <span>{{ pos }}</span>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <label>Subtitle <span class="text-xs text-red-500">(Subtitle should not exceed 255 characters. )</span></label>
        <textarea v-model="subtitle" class="w-full border rounded-lg px-3 py-2" maxlength="255" rows="2"></textarea>
      </div>

      <div class="mb-4">
        <label>Description <span class="text-red-500">*</span></label>
        <textarea v-model="description" @input="handleInput" class="w-full border rounded-lg px-3 py-2" rows="5"
          required></textarea>
      </div>
      <div class="mb-4">
        <label>Email <span class="text-red-500">*</span></label>
        <input type="email" v-model="email" class="w-full border rounded-lg px-3 py-2" required
          placeholder="example@email.com" />
      </div>
      <div class="mb-4">
        <label>Tel <span class="text-red-500">*</span></label>
        <input type="tel" v-model="tel" class="w-full border rounded-lg px-3 py-2" required @input="formatPhone"
          placeholder="080-123-4567" />
      </div>
      <div class="flex flex-row justify-start w-full gap-2 *:">
        <div class="mb-4 flex flex-col w-full">
          <label>Start Date</label>
          <input type="date" v-model="startDate" class="mt-1 border rounded-lg px-3 py-2" @change="logDates" />
        </div>
        <div class="mb-4 flex flex-col w-full">
          <label>End Date <span class="text-red-500">*</span></label>
          <input type="date" v-model="endDate" class="mt-1 border rounded-lg px-3 py-2"
            :min="startDate.toISOString().split('T')[0]" @change="logDates" required />
        </div>
      </div>

      <!-- <div class="mb-4">
        <label>Upload Image</label>
        <input type="file" @change="handleFileUpload" accept="image/*" class="w-full border rounded-lg px-3 py-2" />
      </div> -->


      <div class="flex justify-center space-x-4 mt-4">
        <RouterLink to="/admin/annouce" type="button"
          class="text-white text-xs font-bold bg-gradient-to-b from-button px-4 py-1.5 h-fit to-button/55 shadow-md rounded-lg lg:text-sm">
          Cancel
        </RouterLink>
        <button type="submit"
          class="text-white text-xs font-bold bg-gradient-to-b from-button px-4 py-1.5 h-fit to-button/55 shadow-md rounded-lg lg:text-sm">
          Submit
        </button>
      </div>
    </form>
  </div>

  <div v-if="showError && errorMessages.length > 0"
    class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
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
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add your custom styles here */
</style>
