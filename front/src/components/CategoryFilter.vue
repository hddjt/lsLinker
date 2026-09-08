<script setup>
defineProps({
  categories: { type: Array, required: true },
  modelValue: { type: String, default: 'all' },
  counts: { type: Object, default: () => ({}) },
  total: { type: Number, default: 0 },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="mb-6 flex flex-wrap items-center gap-2">
    <button
      class="chip"
      :class="{ active: modelValue === 'all' }"
      @click="emit('update:modelValue', 'all')"
    >
      全部 <span class="opacity-60">{{ total }}</span>
    </button>
    <button
      v-for="c in categories"
      :key="c.id"
      class="chip"
      :class="{ active: modelValue === c.id }"
      @click="emit('update:modelValue', c.id)"
    >
      {{ c.name }} <span class="opacity-60">{{ counts[c.id] ?? 0 }}</span>
    </button>
  </div>
</template>
