<script setup>
defineProps({
  open: { type: Boolean, default: true },
  title: { type: String, default: '' },
  width: { type: String, default: 'max-w-sm' },
})
const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div class="glass w-full p-6" :class="width">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg">{{ title }}</h3>
            <button class="btn btn-ghost btn-icon" @click="emit('close')">✕</button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
