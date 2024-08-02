<template>
  <div class="chat-box-container w-[80%] h-[80%] flex flex-col justify-between items-stretch p-4">
    <h2 class="text-[#011638]">
      Chat box
    </h2>
    <form class="px-4">
      <div class="w-full flex">
        <input class="bg-transparent b-none b-b-solid b-b-[#011638] text-[#011638] w-full outline-none" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.chat-box-container {
    background: rgba(255, 255, 255, 0.46);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5.5px);
    -webkit-backdrop-filter: blur(5.5px);
    border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
