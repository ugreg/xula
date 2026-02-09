<script setup>
import { ref } from 'vue'
import SearchForm from './components/SearchForm.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import CrashoutCard from './components/CrashoutCard.vue'
import { mockCelebrityData } from './data/mockData.js'

// App state: 'input' | 'loading' | 'result'
const currentState = ref('input')
const searchedName = ref('')
const celebrityData = ref(null)

const handleSearch = (name) => {
  searchedName.value = name
  currentState.value = 'loading'

  // Simulate API call with 3 second delay
  setTimeout(() => {
    // Use mock data but replace the name with what user searched
    celebrityData.value = {
      ...mockCelebrityData,
      name: name
    }
    currentState.value = 'result'
  }, 3000)
}

const handleSearchAnother = () => {
  currentState.value = 'input'
  searchedName.value = ''
  celebrityData.value = null
}
</script>

<template>
  <div class="app">
    <SearchForm
      v-if="currentState === 'input'"
      @search="handleSearch"
    />

    <LoadingScreen
      v-else-if="currentState === 'loading'"
      :celebrity-name="searchedName"
    />

    <CrashoutCard
      v-else-if="currentState === 'result'"
      :celebrity="celebrityData"
      @search-another="handleSearchAnother"
    />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}
</style>
