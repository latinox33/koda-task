<template>
  <div
    class="flex gap-1 justify-start mb-3"
    :class="mainContainerClass"
  >
    <div
      class="w-[40px] h-[40px] min-w-[40px] border-rd-full flex items-center justify-center"
      :class="properties.avatar.class"
    >
      {{ properties.avatar.text }}
    </div>

    <div
      class="flex flex-col w-full max-w-[320px] leading-1.5 py-1 px-2 border-gray-200 bg-gray-100"
      :class="bubbleContainerClass"
    >
      <div class="flex items-center space-x-2 rtl:space-x-reverse">
        <span class="text-sm font-semibold text-gray-900">
          <strong class="text-[#8b8b8b] text-xs">{{ properties.datePlaceholder }}</strong>
          {{ properties.hour }}
        </span>
      </div>
      <p class="text-sm font-normal m-0 py-1 text-gray-900">
        {{ properties.message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IBubbleMessageProperties } from '../interfaces/messages.interface.ts';

const properties = defineProps<IBubbleMessageProperties>();

const mainContainerClass = computed<string>(() =>
    properties.position === 'right' ? 'flex-row-reverse items-end' : '',
);
const bubbleContainerClass = computed<string>(() =>
    properties.position === 'right' ? 'rounded-s-xl rounded-se-xl' : 'rounded-e-xl rounded-es-xl',
);
</script>

<style scoped></style>
