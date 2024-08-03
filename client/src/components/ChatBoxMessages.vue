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
        <ChatBoxMessageBubble v-bind="message" />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { IBubbleMessageProperties } from '../interfaces/messages.interface.ts';
import { nextTick, ref, watch } from 'vue';
import ChatBoxMessageBubble from './ChatBoxMessageBubble.vue';

const properties = defineProps<{
    messages: IBubbleMessageProperties[];
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
