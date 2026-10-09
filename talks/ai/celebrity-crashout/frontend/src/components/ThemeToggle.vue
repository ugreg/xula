<script setup>
defineProps({
  darkMode: Boolean
})
defineEmits(['toggle'])
</script>

<template>
  <button @click="$emit('toggle')" class="theme-toggle" :title="darkMode ? 'Switch to light mode' : 'Switch to dark mode'">
    <svg v-if="!darkMode" class="pokeball-icon light-mode" viewBox="0 0 100 100">
      <!-- Top half - red -->
      <path d="M50 10 A40 40 0 0 1 90 50" fill="#ff1a1a" />
      <!-- Bottom half - white -->
      <path d="M10 50 A40 40 0 0 0 50 90" fill="#ffffff" />
      <!-- Middle band - black -->
      <rect x="10" y="46" width="80" height="8" fill="#222222" />
      <!-- Center button -->
      <circle cx="50" cy="50" r="12" fill="#ffffff" />
    </svg>
    <svg v-else class="pokeball-icon dark-mode" viewBox="0 0 100 100">
      <!-- Top half - dark red -->
      <path d="M50 10 A40 40 0 0 1 90 50" fill="#8b0000" />
      <!-- Bottom half - dark gray -->
      <path d="M10 50 A40 40 0 0 0 50 90" fill="#333333" />
      <!-- Middle band - black -->
      <rect x="10" y="46" width="80" height="8" fill="#000000" />
      <!-- Center button - white with glow -->
      <circle cx="50" cy="50" r="12" fill="#ffffff" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
}
.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}
.pokeball-icon {
  width: 40px;
  height: 40px;
}
</style>
