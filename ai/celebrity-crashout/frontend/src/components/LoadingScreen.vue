<script setup>
defineProps({
  celebrityName: String
})
</script>

<template>
  <div class="loading-container">
    <div class="pokeball">
      <div class="pokeball-top"></div>
      <div class="pokeball-center">
        <div class="pokeball-button"></div>
      </div>
      <div class="pokeball-bottom"></div>
    </div>
    <p class="loading-text">Catching celebrity data...</p>
    <p class="loading-subtext">Searching for {{ celebrityName }}</p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.pokeball {
  width: 150px;
  height: 150px;
  position: relative;
  animation: bounce 0.6s ease-in-out infinite, spin 1s linear infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pokeball-top {
  width: 100%;
  height: 50%;
  background: #ff1a1a;
  border-radius: 75px 75px 0 0;
  border: 5px solid #222;
  border-bottom: none;
  box-sizing: border-box;
}

.pokeball-center {
  width: 100%;
  height: 15px;
  background: #222;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pokeball-button {
  width: 40px;
  height: 40px;
  background: #fff;
  border: 5px solid #222;
  border-radius: 50%;
  position: absolute;
  z-index: 10;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.5); }
  50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.9); }
}

.pokeball-bottom {
  width: 100%;
  height: 50%;
  background: #fff;
  border-radius: 0 0 75px 75px;
  border: 5px solid #222;
  border-top: none;
  box-sizing: border-box;
}

.loading-text {
  margin-top: 3rem;
  font-size: 1.8rem;
  font-weight: bold;
  color: #FFCB05;
  animation: fadeInOut 1.5s ease-in-out infinite;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.loading-subtext {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  color: #888;
}
</style>
