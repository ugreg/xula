<script setup>
import { ref, computed } from 'vue'
import SearchForm from './components/SearchForm.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import CrashoutCard from './components/CrashoutCard.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import { searchCelebrity } from './api/celebrity.js'

const darkMode = ref(false)
const toggleDark = () => {
  darkMode.value = !darkMode.value
  document.body.dataset.theme = darkMode.value ? 'dark' : 'light'
}

const currentState = ref('input')
const searchedName = ref('')
const celebrityData = ref(null)
const searchError = ref('')

const handleSearch = async (name) => {
  searchedName.value = name
  searchError.value = ''
  currentState.value = 'loading'

  try {
    celebrityData.value = await searchCelebrity(name)
    currentState.value = 'result'
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Could not load celebrity data.'
    searchError.value =
      message === 'Failed to fetch'
        ? 'Cannot reach the server. Is the API running on port 3001?'
        : message
    currentState.value = 'input'
  }
}

const handleSearchAnother = () => {
  currentState.value = 'input'
  searchedName.value = ''
  celebrityData.value = null
  searchError.value = ''
}
</script>

<template>
  <div class="app">
    <ThemeToggle :dark-mode="darkMode" @toggle="toggleDark" />

    <SearchForm
      v-if="currentState === 'input'"
      :error-message="searchError"
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
