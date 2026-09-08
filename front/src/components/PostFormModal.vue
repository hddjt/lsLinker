<script setup>
import { reactive, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import { addPost } from '../stores/posts'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'created'])

const form = reactive({ title: '', body: '' })

watch(
  () => props.open,
  (v) => {
    if (v) Object.assign(form, { title: '', body: '' })
  },
)

function submit() {
  if (!form.title.trim() || !form.body.trim()) return
  const p = addPost({ ...form })
  emit('created', p)
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" title="发新帖" width="max-w-lg" @close="emit('close')">
    <form class="flex flex-col gap-3" @submit.prevent="submit">
      <input v-model="form.title" class="input" placeholder="标题 *" maxlength="60" />
      <textarea
        v-model="form.body"
        class="input !min-h-[180px]"
        placeholder="正文 *（当前为纯文本展示，支持换行）"
      />
      <div class="mt-2 flex justify-end gap-2">
        <button type="button" class="btn btn-ghost" @click="emit('close')">取消</button>
        <button type="submit" class="btn btn-primary" :disabled="!form.title.trim() || !form.body.trim()">
          发布
        </button>
      </div>
    </form>
  </BaseModal>
</template>
