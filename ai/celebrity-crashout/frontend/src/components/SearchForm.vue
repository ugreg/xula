<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search'])
const celebrityName = ref('')

const handleSubmit = () => {
  if (celebrityName.value.trim()) {
    emit('search', celebrityName.value)
  }
}
</script>

<template>
  <div class="search-container">
    <h1 class="title">Celebrity Crashout Tracker</h1>
    <p class="subtitle">Discover the rise and fall of your favorite celebrities</p>

    <form @submit.prevent="handleSubmit" class="search-form">
      <input
        v-model="celebrityName"
        type="text"
        placeholder="Enter celebrity name..."
        class="search-input"
      />
      <button type="submit" class="search-button">
        <span class="pokeball-icon">◓</span>
        Catch Their Story
      </button>
    </form>
  </div>
</template>

<style scoped>
.search-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  color: #FFCB05;
  text-shadow:
    3px 3px 0 #3D7DCA,
    -1px -1px 0 #3D7DCA,
    1px -1px 0 #3D7DCA,
    -1px 1px 0 #3D7DCA;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
}

.search-input {
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  border: 3px solid #3D7DCA;
  border-radius: 50px;
  outline: none;
  transition: all 0.3s ease;
  background: #ffffff;
  color: #1a1a1a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-input:focus {
  border-color: #FFCB05;
  box-shadow: 0 0 15px rgba(255, 203, 5, 0.5);
}

.search-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(180deg, #FFCB05 0%, #F5A623 100%);
  border: 3px solid #3D7DCA;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.search-button:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 20px rgba(61, 125, 202, 0.4);
}

.search-button:active {
  transform: scale(0.98);
}

.pokeball-icon {
  font-size: 1.4rem;
}
</style>
