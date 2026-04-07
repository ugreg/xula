<script setup>
defineProps({
  celebrity: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['searchAnother'])
</script>

<template>
  <div class="card-container">
    <div class="pokemon-card">
      <!-- Holographic overlay -->
      <div class="holo-overlay"></div>

      <!-- Card content -->
      <div class="card-content">
        <!-- Header -->
        <div class="card-header">
          <span class="card-type">{{ celebrity.type }}</span>
          <span class="card-hp">HP {{ celebrity.hp }}</span>
        </div>

        <!-- Image area -->
        <div class="card-image">
          <div class="silhouette">
            <span class="silhouette-icon">👤</span>
          </div>
        </div>

        <!-- Name -->
        <h2 class="card-name">{{ celebrity.name }}</h2>

        <!-- Timeline (moves area) -->
        <div class="timeline">
          <div
            v-for="(event, index) in celebrity.timeline"
            :key="index"
            class="timeline-event"
            :class="{ 'crashout': event.title === 'The Crashout' }"
          >
            <span class="event-icon">{{ event.icon }}</span>
            <div class="event-details">
              <span class="event-title">{{ event.title }}</span>
              <span class="event-description">{{ event.description }}</span>
              <span class="event-date">{{ event.date }}</span>
            </div>
          </div>
        </div>

        <!-- Stats bar -->
        <div class="stats-bar">
          <div class="stat">
            <span class="stat-label">Fame</span>
            <span class="stat-value">
              <span v-for="n in 5" :key="n" class="star" :class="{ 'filled': n <= celebrity.stats.fame }">⭐</span>
            </span>
          </div>
          <div class="stat">
            <span class="stat-label">Drama</span>
            <span class="stat-value">
              <span v-for="n in 5" :key="n" class="fire" :class="{ 'filled': n <= celebrity.stats.drama }">🔥</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <button @click="emit('searchAnother')" class="search-another-btn">
      Search Another Celebrity
    </button>
  </div>
</template>

<style scoped>
.card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%);
}

[data-theme="light"] .card-container {
  background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
}

.pokemon-card {
  width: 350px;
  background: linear-gradient(145deg, #FFCB05 0%, #F5A623 100%);
  border-radius: 15px;
  padding: 12px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: perspective(1000px) rotateY(0deg);
  transition: transform 0.3s ease;
}

.pokemon-card:hover {
  transform: perspective(1000px) rotateY(5deg) scale(1.02);
}

.holo-overlay {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    105deg,
    transparent 20%,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.3) 30%,
    rgba(255, 219, 112, 0.3) 35%,
    rgba(255, 182, 193, 0.2) 40%,
    rgba(173, 216, 230, 0.2) 45%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 55%
  );
  pointer-events: none;
  z-index: 10;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 200%; }
}

.card-content {
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  position: relative;
  z-index: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-type {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-hp {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e74c3c;
}

.card-image {
  background: linear-gradient(180deg, #a8d8ea 0%, #aa96da 100%);
  border-radius: 8px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  border: 3px solid #FFCB05;
}

.silhouette {
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.silhouette-icon {
  font-size: 3rem;
  opacity: 0.7;
}

.card-name {
  text-align: center;
  font-size: 1.4rem;
  font-weight: bold;
  color: #333;
  margin: 8px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.timeline {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}

.timeline-event {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.timeline-event:last-child {
  border-bottom: none;
}

.timeline-event.crashout {
  background: linear-gradient(90deg, rgba(231, 76, 60, 0.1) 0%, transparent 100%);
  border-radius: 5px;
  padding: 8px;
  margin: 0 -5px;
}

.timeline-event.crashout .event-title {
  color: #e74c3c;
}

.event-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-title {
  font-weight: bold;
  font-size: 0.85rem;
  color: #333;
}

.event-description {
  font-size: 0.75rem;
  color: #666;
}

.event-date {
  font-size: 0.7rem;
  color: #999;
  font-style: italic;
}

.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background: linear-gradient(180deg, #f0f0f0 0%, #e0e0e0 100%);
  border-radius: 8px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: bold;
  color: #666;
  text-transform: uppercase;
}

.stat-value {
  display: flex;
  gap: 2px;
}

.star, .fire {
  font-size: 0.9rem;
  opacity: 0.2;
  transition: opacity 0.3s;
}

.star.filled, .fire.filled {
  opacity: 1;
}

.search-another-btn {
  margin-top: 2rem;
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

.search-another-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 78, 80, 0.4);
}

.search-another-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(255, 78, 80, 0.3);
}
</style>
