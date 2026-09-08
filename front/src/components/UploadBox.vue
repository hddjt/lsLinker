<script setup>
import { ref } from 'vue'
import { uid } from '../utils/storage'
import { pushFile } from '../stores/transfer'
import { currentUser } from '../stores/auth'

defineProps({ active: { type: Boolean, default: true } })
const emit = defineEmits(['sending', 'sent'])

const MAX = 10 * 1024 * 1024 // 10MB 占位限制
const dragging = ref(false)
const fileInput = ref(null)

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function simulateUpload(file) {
  const size = file.size
  const id = uid('f')
  const item = {
    id,
    name: file.name,
    size,
    progress: 0,
    error: false,
  }
  emit('sending', item)
  const steps = 8
  let i = 0
  const tick = () => {
    i += 1
    const progress = Math.min(100, Math.round((i / steps) * 100))
    emit('sending', { ...item, progress })
    if (i < steps) setTimeout(tick, 160 + Math.random() * 200)
    else emit('sent', item)
  }
  tick()
}

function onFiles(files) {
  for (const f of files) {
    if (f.size > MAX) {
      alert(`「${f.name}」超过 10MB 占位限制（当前演示不接受）`)
      continue
    }
    simulateUpload(f)
  }
}

function onDrop(e) {
  dragging.value = false
  onFiles([...e.dataTransfer.files])
}

function onPick() {
  fileInput.value?.click()
}

function onChoose(e) {
  onFiles([...e.target.files])
  e.target.value = ''
}
</script>

<template>
  <div>
    <div
      class="grid min-h-[160px] cursor-pointer place-items-center rounded-xl border border-dashed p-6 text-center transition-colors"
      :class="
        dragging
          ? 'border-[#8fa6ff] bg-[#6d8dff]/10'
          : 'border-white/15 hover:border-white/30 hover:bg-white/[0.03]'
      "
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
      @click="onPick"
    >
      <div>
        <div class="mb-2 text-3xl">📦</div>
        <p class="text-[14px] font-medium text-[--text-h]">
          {{ dragging ? '松开即可上传' : '拖拽文件到这里，或点击选择' }}
        </p>
        <p class="muted mt-1 text-[12px]">单文件 ≤ 10MB（占位限制）</p>
      </div>
      <input ref="fileInput" type="file" class="hidden" multiple @change="onChoose" />
    </div>
  </div>
</template>
