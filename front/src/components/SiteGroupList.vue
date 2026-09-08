<script setup>
import SiteCard from './SiteCard.vue'

defineProps({
  grouped: { type: Array, required: true },
})
const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div v-for="g in grouped" :key="g.cat?.id || 'all'" class="mb-8">
    <div class="mb-3 flex items-center gap-2">
      <h2 class="text-[15px] font-semibold text-[--text-h]">{{ g.cat?.name || '未分类' }}</h2>
      <span class="muted text-[12px]">{{ g.list.length }} 个</span>
      <span class="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <SiteCard
        v-for="s in g.list"
        :key="s.id"
        :site="s"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
