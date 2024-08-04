<template>
  <div class="chat-box-container w-[80%] h-[80%] flex flex-col justify-between items-stretch p-4">
    <h2 class="text-[#011638] b-b-[#011638] b-b-solid pb-2 mt-0">
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
import { IBubbleMessageProperties, IMessage } from '../interfaces/messages.interface.ts';

const url = ref<string>('http://localhost:3000/api/flights/get-flights');

const promptText = ref<string>('');
const messages = ref<IBubbleMessageProperties[]>([]);
let intervalId: ReturnType<typeof setTimeout>;

const sendMessage = async (): Promise<void> => {
    if (!promptText.value) return;

    messages.value.push({
        author: 'user',
        message: promptText.value,
        ...prepareDateModel(),
        position: 'right',
        avatar: {
            class: 'bg-y-text-b',
            text: 'You',
        },
    });
    const _promptText = promptText.value;
    promptText.value = '';

    if (intervalId) clearInterval(intervalId);
    intervalId = setTimeout(() => {
        messages.value.push({
            author: 'ai',
            message: '...',
            ...prepareDateModel(),
            position: 'left',
            avatar: {
                class: 'bg-b-text-w',
                text: 'AI',
            },
        });
    }, 500);

    const { data: responseData } = await useFetch(url).post({ promptText: _promptText }).json();
    updateMessage(responseData.value);
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

const updateMessage = (props: { status: string; message: string }) => {
    if (intervalId) clearInterval(intervalId);
    intervalId = setTimeout(() => {
        const key = messages.value.length - 1;

        messages.value[key] = {
            ...messages.value[key],
            message: props.message,
            ...prepareDateModel(),
        };
    }, 1500);
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
