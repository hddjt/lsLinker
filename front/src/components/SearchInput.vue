<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '搜索' },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60">🔍</span>
    <input
      :value="modelValue"
      class="input !pr-9 !pl-9"
      :placeholder="placeholder"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <button
      v-if="modelValue"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-60 hover:opacity-100"
      title="清除"
      @click="emit('update:modelValue', '')"
    >
      ✕
    </button>
  </div>
</template>
