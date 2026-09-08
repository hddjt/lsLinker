<script setup>
defineProps({
  icon: { type: String, default: '🗂️' },
  text: { type: String, required: true },
})
</script>

<template>
  <div class="glass p-10 text-center text-[--text-mute]">
    <div class="mb-2 text-3xl">{{ icon }}</div>
    {{ text }}
  </div>
</template>
