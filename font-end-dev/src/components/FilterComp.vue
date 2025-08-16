<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  positions: {
    type: Array as () => string[],
    default: () => [],
  },
})

const search = ref('')
const position = ref('')
const startDate = ref('')
const endDate = ref('')
const route = useRoute()
const emit = defineEmits(['updateSearch', 'updatePosition', 'updateStartDate', 'updateEndDate'])

const updateSearch = () => {
  emit('updateSearch', search.value)
}

const updatePosition = () => {
  emit('updatePosition', position.value)
}

const updateStartDate = () => {
  emit('updateStartDate', startDate.value)
}

const updateEndDate = () => {
  emit('updateEndDate', endDate.value)
}
</script>

<template>
  <div v-bind="$attrs"
    class="flex flex-row space-x-2 px-2 justify-center items-center font-Prompt mt-4 w-full sm:px-12 md:px-16 lg:px-32 lg:py-4 xl:px-56 2xl:px-96">
    <input type="text" v-model="search" @input="updateSearch" placeholder="Search..."
      class="border w-full p-2 rounded-lg bg-border text-sm hover:shadow-md placeholder-text" />
    <select v-show="route.path === '/posts'" v-model="position" @change="updatePosition"
      class="border p-2 rounded-lg bg-border text-sm hover:shadow-md placeholder-text">
      <option value="">All Positions</option>
      <option v-for="pos in props.positions" :key="pos" :value="pos">{{ pos }}</option>
    </select>
    <div class="flex-row hidden justify-center items-center gap-1 font-Prompt lg:flex">
      <span class="text-sm font-bold whitespace-nowrap">Start : </span>
      <input type="date" v-model="startDate" @change="updateStartDate" class="border rounded-md p-1"
        placeholder="Start Date" />
      <span class="text-sm font-bold whitespace-nowrap">End : </span>
      <input type="date" v-model="endDate" @change="updateEndDate" class="border rounded-md p-1"
        placeholder="End Date" />
    </div>
  </div>

  <div class="flex flex-col justify-center items-center mt-2 mb-2 gap-1 font-Prompt lg:hidden">
    <span class="text-sm font-bold">Start Date</span>
    <input type="date" v-model="startDate" @change="updateStartDate" class="border rounded-md p-1"
      placeholder="Start Date" />
    <span class="text-sm font-bold">End Date</span>
    <input type="date" v-model="endDate" @change="updateEndDate" class="border rounded-md p-1" placeholder="End Date" />
  </div>
</template>
