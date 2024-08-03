<template>
  <div
    ref="messagesContainer"
    class="h-full overflow-auto overflow-x-hidden xl:pr-xl"
  >
    <TransitionGroup
      name="list"
      tag="div"
    >
      <div
        v-for="(message, idx) in properties.messages"
        :key="idx"
      >
        <div
          class="flex gap-1 justify-start mb-3"
          :class="{
            'flex-row-reverse items-end': message.author === 'user',
            'flex-row-reverse items-start': message.author === 'user',
          }"
        >
          <div
            class="w-[40px] h-[40px] min-w-[40px] border-rd-full flex items-center justify-center"
            :class="{
              'bg-[#FFC333] text-[#0f0b0b]': message.author === 'user',
              'bg-[#0f0b0b]': message.author === 'ai',
            }"
          >
            {{ message.author === 'user' ? 'You' : 'AI' }}
          </div>
          <div
            class="flex flex-col w-full max-w-[320px] leading-1.5 py-1 px-2 border-gray-200 bg-gray-100 dark:bg-gray-700"
            :class="{
              'rounded-e-xl rounded-es-xl': message.author === 'ai',
              'rounded-s-xl rounded-se-xl': message.author === 'user',
            }"
          >
            <div class="flex items-center space-x-2 rtl:space-x-reverse">
              <span class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ message.author }}
              </span>
              <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                <strong class="text-[#afabab]">{{ message.datePlaceholder }}</strong> {{ message.hour }}
              </span>
            </div>
            <p class="text-sm font-normal m-0 py-1 text-gray-900 dark:text-white">
              {{ message.message }}
            </p>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { IMessage } from '../interfaces/messages.interface.ts';
import { nextTick, ref, watch } from 'vue';

const properties = defineProps<{
    messages: IMessage[];
}>();
const messagesContainer = ref<HTMLElement | null>(null);

watch(properties.messages, async () => {
    await nextTick();
    if (messagesContainer.value) {
        messagesContainer.value.scrollTo({
            top: messagesContainer.value.scrollHeight,
            behavior: 'smooth',
        });
    }
});
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>
