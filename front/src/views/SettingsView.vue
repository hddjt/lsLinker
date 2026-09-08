<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, setNickname, login, logout } from '../stores/auth'
import { initials } from '../utils/storage'
import { useEffects, toggleEffect } from '../stores/effects'

const auth = useAuth()
const router = useRouter()
const effects = useEffects()

const nickForm = reactive({ name: '' })
watch(
  () => auth.nickname,
  (v) => {
    nickForm.name = v || ''
  },
  { immediate: true },
)

const saved = ref(false)
const error = ref('')
const confirmingClear = ref(false)
const fileInput = ref(null)

const PREFIX = 'lsLinker:'

function saveProfile() {
  if (!nickForm.name.trim()) return
  setNickname(nickForm.name)
  saved.value = true
  setTimeout(() => (saved.value = false), 2000)
}

function loginNow() {
  if (!nickForm.name.trim()) return
  login(nickForm.name)
}

function doLogout() {
  logout()
  router.push('/')
}

function backupName() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `lsLinker-backup-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.json`
}

function exportData() {
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k.startsWith(PREFIX)) data[k] = localStorage.getItem(k)
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = backupName()
  a.click()
  URL.revokeObjectURL(url)
  error.value = ''
}

function onPickImport() {
  const f = fileInput.value?.files?.[0]
  if (!f) return
  f.text()
    .then((text) => {
      const data = JSON.parse(text)
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('格式不正确')
      let count = 0
      for (const [k, v] of Object.entries(data)) {
        if (k.startsWith(PREFIX)) {
          localStorage.setItem(k, v)
          count++
        }
      }
      if (!count) throw new Error('未找到 lsLinker 数据')
      location.reload()
    })
    .catch((e) => {
      error.value = `导入失败：${e.message || '文件解析错误'}`
    })
    .finally(() => {
      if (fileInput.value) fileInput.value.value = ''
    })
}

function clearAll() {
  const keys = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k.startsWith(PREFIX)) keys.push(k)
  }
  keys.forEach((k) => localStorage.removeItem(k))
  location.reload()
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <div class="mb-6">
      <h1 class="text-2xl">个人设置</h1>
      <p class="muted mt-1 text-[13px]">账号资料 · 登录状态 · 本地数据管理</p>
    </div>

    <div class="glass p-6">
      <h2 class="mb-4 text-[15px] font-semibold">个人资料</h2>
      <div class="flex items-center gap-4">
        <span
          class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[--field-bg] text-lg font-bold text-[--text-h] ring-1 ring-white/10"
        >
          {{ initials(auth.nickname) }}
        </span>
        <div class="min-w-0 flex-1">
          <label class="muted mb-1 block text-[12px]">昵称</label>
          <div class="flex items-center gap-2">
            <input
              v-model="nickForm.name"
              class="input flex-1"
              placeholder="输入新昵称"
              maxlength="16"
              :disabled="!auth.token"
            />
            <button class="btn btn-primary shrink-0" :disabled="!auth.token || !nickForm.name.trim()" @click="saveProfile">
              保存
            </button>
          </div>
          <p v-if="saved" class="mt-1 text-[12px] text-[--ok]">✓ 昵称已更新</p>
          <p v-else-if="!auth.token" class="mt-1 text-[12px] text-[--text-mute]">登录后才能修改昵称</p>
        </div>
      </div>
    </div>

    <div class="glass mt-6 p-6">
      <h2 class="mb-4 text-[15px] font-semibold">账号</h2>
      <template v-if="auth.token">
        <div class="flex flex-col gap-3 text-[13px]">
          <div class="flex items-center gap-3">
            <span class="w-20 shrink-0 text-[--text-mute]">登录状态</span>
            <span class="flex items-center gap-1.5 text-[--ok]">
              <span class="inline-block h-1.5 w-1.5 rounded-full bg-[--ok]" /> 已登录
            </span>
          </div>
          <div class="flex items-center gap-3">
            <span class="w-20 shrink-0 text-[--text-mute]">当前昵称</span>
            <span class="text-[--text-h]">{{ auth.nickname }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="w-20 shrink-0 text-[--text-mute]">Token</span>
            <code class="truncate text-[11px] text-[--primary]">{{ auth.token }}</code>
          </div>
        </div>
        <div class="mt-5 flex justify-end">
          <button class="btn btn-ghost" @click="doLogout">退出登录</button>
        </div>
      </template>
      <template v-else>
        <p class="muted mb-4 text-[13px]">当前为游客状态，部分功能（新增站点、发帖、聊天等）需要登录。使用 localStorage 占位登录：</p>
        <div class="flex items-center gap-2">
          <input
            v-model="nickForm.name"
            class="input flex-1"
            placeholder="输入昵称登录"
            maxlength="16"
          />
          <button class="btn btn-primary shrink-0" :disabled="!nickForm.name.trim()" @click="loginNow">
            进入
          </button>
        </div>
      </template>
    </div>

    <div class="glass mt-6 p-6">
      <h2 class="mb-1 text-[15px] font-semibold">动态效果</h2>
      <p class="muted mb-4 text-[12px]">雨打玻璃背景（WebGL2 全屏叠层），关闭可降低显卡与电量开销。</p>

      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-[13px] text-[--text-h]">动态背景</p>
          <p class="muted mt-0.5 text-[12px]">
            {{ effects.enabled ? '当前已开启 · 雨滴折射 + 光影' : '当前已关闭' }}
          </p>
        </div>
        <button
          class="switch"
          :class="{ on: effects.enabled }"
          role="switch"
          :aria-checked="effects.enabled"
          @click="toggleEffect"
        >
          <span class="knob" />
        </button>
      </div>
    </div>

    <div class="glass mt-6 p-6">
      <h2 class="mb-1 text-[15px] font-semibold">数据管理</h2>
      <p class="muted mb-4 text-[12px]">当前数据保存在浏览器 localStorage，建议定期导出备份。</p>

      <div class="flex flex-wrap gap-2">
        <button class="btn btn-primary" @click="exportData">⬇ 导出备份</button>
        <button class="btn" @click="fileInput?.click()">⬆ 导入备份</button>
        <input ref="fileInput" type="file" accept="application/json,.json" class="hidden" @change="onPickImport" />
        <button v-if="!confirmingClear" class="btn !bg-[--danger]/15 !text-[--danger]" @click="confirmingClear = true">
          清空所有数据
        </button>
      </div>

      <div v-if="confirmingClear" class="mt-4 rounded-xl bg-[--danger]/10 p-4">
        <p class="text-[13px] text-[--danger]">⚠ 将删除全部站点、帖子、收藏、聊天记录等，且不可恢复。确认清空？</p>
        <div class="mt-3 flex justify-end gap-2">
          <button class="btn btn-ghost" @click="confirmingClear = false">取消</button>
          <button class="btn btn-primary !bg-[--danger]" @click="clearAll">确认清空</button>
        </div>
      </div>

      <p v-if="error" class="mt-3 text-[12px] text-[--danger]">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.switch {
  position: relative;
  flex: none;
  width: 46px;
  height: 26px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(20, 72, 83, 0.28);
  cursor: pointer;
  transition: background-color var(--ease), border-color var(--ease);
  padding: 0;
}
.switch .knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--text-mute);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
  transition: transform 180ms ease, background-color var(--ease);
}
.switch.on {
  border-color: transparent;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  box-shadow: 0 6px 18px -6px rgba(52, 213, 195, 0.72);
}
.switch.on .knob {
  transform: translateX(20px);
  background: #fff;
}
</style>
