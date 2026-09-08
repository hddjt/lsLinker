<script setup>
import BaseModal from './BaseModal.vue'

defineProps({
  open: { type: Boolean, default: false },
  site: { type: Object, default: null },
})
const emit = defineEmits(['confirm', 'close'])
</script>

<template>
  <BaseModal
    :open="open"
    :title="site ? `删除站点「${site.name}」？` : ''"
    @close="emit('close')"
  >
    <p class="text-[13px] text-[--text-mute]">该操作不可恢复，确定删除吗？</p>
    <div class="mt-4 flex justify-end gap-2">
      <button class="btn btn-ghost" @click="emit('close')">取消</button>
      <button class="btn btn-primary !bg-[--danger]" @click="emit('confirm')">删除</button>
    </div>
  </BaseModal>
</template>
