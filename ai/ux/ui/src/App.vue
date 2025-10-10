<template>
  <main class="container">
    <h1>My ChatGPT</h1>
    <div class="chat-box">
      <div v-for="(msg, idx) in messages" :key="idx" class="message">
        <strong v-if="msg.role === 'user'">You:</strong>
        <strong v-else>Bot:</strong>
        <span>{{ msg.content }}</span>
      </div>
    </div>

    <input
      v-model="input"
      @keyup.enter="sendMessage"
      placeholder="Type a message..."
    />
    <button @click="sendMessage">Send</button>
  </main>
</template>

<script setup lang="ts">

import axios from 'axios';
import { ref } from 'vue'

interface Message {
  role: 'user' | 'bot'
  content: string
}

const messages = ref<Message[]>([])
const input = ref('')

const sendMessage = async () => {
  if (!input.value.trim()) return

  messages.value.push({ role: 'user', content: ' ' + input.value })
  const userMessage = input.value
  input.value = ''
  try {
    messages.value.push({ role: 'bot', content: ' Thinking...' })
    const response = await axios.post('http://localhost:8000/api/chat', {
      prompt: userMessage
    });
    let reply = response.data;
    messages.value.push({ role: 'bot', content: ' ' + reply })
  } catch (error) {
    messages.value.push({ role: 'bot', content: ' ⚠️ Error contacting backend.' })
    console.error(error)
  }
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 2rem auto;
  font-family: sans-serif;
}

.chat-box {
  border: 1px solid #ccc;
  padding: 1rem;
  height: 300px;
  overflow-y: auto;
  background: #f9f9f9;
  margin-bottom: 1rem;
}

.message {
  margin: 0.5rem 0;
}

input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}

button {
  width: 100%;
  padding: 0.5rem;
}
</style>
