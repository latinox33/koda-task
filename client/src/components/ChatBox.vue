<template>
  <div class="chat-box-container w-[80%] h-[80%] flex flex-col justify-between items-stretch p-4">
    <h2 class="text-[#011638] b-b-[#011638] b-b-solid pb-2">
      Chat box
    </h2>
    <ChatBoxMessages :messages="messages" />
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
import { onUnmounted, ref } from 'vue';
import ChatBoxMessages from './ChatBoxMessages.vue';
import { useFetch } from '@vueuse/core';
import { IMessage } from '../interfaces/messages.interface.ts';

const url = ref<string>('http://localhost:3000/api/flights/get-flights');

const promptText = ref<string>('');
const messages = ref<IMessage[]>([]);
let intervalId: ReturnType<typeof setTimeout>;

const sendMessage = async (): Promise<void> => {
    if (!promptText.value) return;

    const dateModelsForYou = prepareDateModel();
    messages.value.push({
        author: 'user',
        message: promptText.value,
        ...dateModelsForYou,
    });
    promptText.value = '';

    if (intervalId) clearInterval(intervalId);
    intervalId = setTimeout(() => {
        const dateModelForAi = prepareDateModel();
        messages.value.push({
            author: 'ai',
            message: 'cos tam cos tam',
            ...dateModelForAi,
        });
    }, 500);

    // const { data: responseData } = await useFetch(url)
    //     .post({ promptText: promptText.value })
    //     .json();
    // console.log(responseData.value);
};

const prepareDateModel = (): Pick<IMessage, 'date' | 'datePlaceholder' | 'hour'> => {
    const now = new Date();

    const date = now.toISOString().split('T')[0];
    const hour = now.toTimeString().slice(0, 5);

    return { date, hour, datePlaceholder: 'dzisiaj' };
};

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
});
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
