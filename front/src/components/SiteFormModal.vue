<script setup>
import { reactive, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import { addSite, updateSite } from '../stores/sites'
import { useSites } from '../stores/sites'
import { siteIcon } from '../utils/storage'

const props = defineProps({
  open: { type: Boolean, default: false },
  editing: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const { categories } = useSites()
const form = reactive({ name: '', url: '', desc: '', icon: '', category: '' })

const previewSrc = computed(() => form.icon.trim() || siteIcon(form.url))

watch(
  () => props.open,
  (v) => {
    if (!v) return
    if (props.editing) {
      Object.assign(form, {
        name: props.editing.name,
        url: props.editing.url,
        desc: props.editing.desc,
        icon: props.editing.icon || '',
        category: props.editing.category,
      })
    } else {
      Object.assign(form, { name: '', url: '', desc: '', icon: '', category: categories[0]?.id || '' })
    }
  },
)

function submit() {
  if (!form.name.trim() || !form.url.trim()) return
  if (props.editing) {
    updateSite(props.editing.id, { ...form })
  } else {
    addSite({ ...form })
  }
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" :title="editing ? '编辑站点' : '新增站点'" @close="emit('close')">
    <form class="flex flex-col gap-3" @submit.prevent="submit">
      <input v-model="form.name" class="input" placeholder="站点名称 *" maxlength="30" />
      <input v-model="form.url" class="input" placeholder="链接，如 github.com *" />
      <div class="flex items-center gap-2">
        <div class="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/[0.07] ring-1 ring-white/10">
          <img
            v-if="previewSrc"
            :src="previewSrc"
            alt=""
            class="h-5 w-5 object-contain"
            @error="($event.target.style.display = 'none')"
          />
          <span v-else class="text-sm font-bold text-[--text-h]">{{ form.name[0] || '?' }}</span>
        </div>
        <input
          v-model="form.icon"
          class="input"
          placeholder="图标链接（可选），留空则用站点 favicon"
          maxlength="200"
        />
      </div>
      <input v-model="form.desc" class="input" placeholder="一句话描述" maxlength="60" />
      <select v-model="form.category" class="input cursor-pointer">
        <option v-for="c in categories" :key="c.id" :value="c.id">
          {{ c.name }}
        </option>
      </select>
      <div class="mt-2 flex justify-end gap-2">
        <button type="button" class="btn btn-ghost" @click="emit('close')">取消</button>
        <button type="submit" class="btn btn-primary" :disabled="!form.name.trim() || !form.url.trim()">
          保存
        </button>
      </div>
    </form>
  </BaseModal>
</template>
