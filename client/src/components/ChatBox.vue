<template>
  <div class="chat-box-container w-[80%] h-[80%] flex flex-col justify-between items-stretch p-4">
    <h2 class="text-[#011638]">
      Chat box
    </h2>
    <div class="w-full flex gap-2">
      <input
        v-model.trim="promptText"
        class="bg-transparent b-none b-b-solid b-b-[#011638] text-[#011638] w-full outline-none"
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">
        >
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFetch } from '@vueuse/core';

const url = ref<string>('http://localhost:3000/api/flights/get-flights');

const promptText = ref<string>('');

const sendMessage = async (): Promise<void> => {
    if (!promptText.value) return;

    const { data: responseData } = await useFetch(url).post({ promptText: promptText.value }).json();
    promptText.value = '';

    console.log(responseData.value);
};
</script>

<style scoped>
.chat-box-container {
    background: rgba(255, 255, 255, 0.33);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5.5px);
    -webkit-backdrop-filter: blur(5.5px);
    border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
