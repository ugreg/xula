<script setup>
import { ref } from 'vue'

defineProps({
  errorMessage: {
    type: String,
    default: '',
  },
})

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
    <h1 class="title">Celebrity Crashout</h1>
    <p class="subtitle">The Winds and Waves of Fame</p>
    <p class="tagline">Discover the rise and fall of your favorite stars</p>

    <p v-if="errorMessage" class="error-banner" role="alert">{{ errorMessage }}</p>

    <form @submit.prevent="handleSubmit" class="search-form">
      <div class="input-wrapper">
        <input
          v-model="celebrityName"
          type="text"
          placeholder="Enter celebrity name..."
          class="search-input"
          autocomplete="off"
        />
      </div>
      <button type="submit" class="search-button">
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
  padding: 4rem 2rem 2rem;
  gap: 2rem;
  position: relative;
}

.title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 0.5rem;
  text-shadow: none;
  position: relative;
  background: linear-gradient(135deg, #ff4e50 0%, #f9d423 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

[data-theme="dark"] .title {
  color: #ffffff;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: clamp(1.1rem, 3vw, 1.5rem);
  color: #666;
  text-align: center;
  margin-bottom: 0.5rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.tagline {
  font-size: 0.95rem;
  color: #888;
  text-align: center;
  max-width: 400px;
  line-height: 1.6;
}

[data-theme="dark"] .subtitle {
  color: #a0a0a0;
}

[data-theme="dark"] .tagline {
  color: #909090;
}

.error-banner {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 12px;
  background: rgba(231, 76, 60, 0.15);
  border: 2px solid #e74c3c;
  color: #c0392b;
  font-size: 0.95rem;
  text-align: center;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 480px;
}

.input-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 1.2rem 1.5rem;
  font-size: 1.1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  outline: none;
  transition: all 0.3s ease;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-input:focus {
  border-color: #f9d423;
  box-shadow: 0 4px 16px rgba(249, 212, 35, 0.3), 0 0 0 4px rgba(249, 212, 35, 0.1);
  transform: translateY(-2px);
}

[data-theme="dark"] .search-input {
  background: #1a1a2e;
  border-color: #333;
  color: #ffffff;
}

[data-theme="dark"] .search-input:focus {
  border-color: #ffd93d;
  box-shadow: 0 4px 16px rgba(255, 217, 61, 0.3), 0 0 0 4px rgba(255, 217, 61, 0.15);
}

.search-button {
  padding: 1.1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #ff4e50 0%, #f9d423 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 12px rgba(255, 78, 80, 0.3);
}

.search-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 78, 80, 0.4);
}

.search-button:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(255, 78, 80, 0.3);
}
</style>
