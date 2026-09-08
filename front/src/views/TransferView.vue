<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import UploadBox from '../components/UploadBox.vue'
import {
  useTransfer,
  joinRoom,
  leaveRoom,
  isValidKey,
  pushText,
  pushFile,
  peerText,
  peerFile,
  totalUnread,
} from '../stores/transfer'
import { isLoggedIn } from '../stores/auth'
import { timeAgo, fmtSize } from '../utils/storage'

const transfer = useTransfer()
const keyInput = ref('')
const textInput = ref('')
const tab = ref('text')
const uploading = ref([])
let peerTimer = null
let ambientTimer = null

const inRoom = computed(() => !!transfer.activeRoom)
const room = computed(() => (transfer.activeRoom ? transfer.rooms[transfer.activeRoom] : null))
const knownRooms = computed(() => Object.keys(transfer.rooms))
const keyOk = computed(() => isValidKey(keyInput.value))

const autoTexts = [
  '这是对端发来的文本片段（模拟）。',
  '记得把这份资料存档到本地哦。',
  '收到，收到，请查收。',
]

function join() {
  if (!keyOk.value) return
  joinRoom(keyInput.value)
  keyInput.value = ''
  startPeer()
}

function joinExisting(k) {
  joinRoom(k)
  startPeer()
}

function quit() {
  leaveRoom()
  stopPeer()
}

function sendText() {
  if (!textInput.value.trim()) return
  pushText(textInput.value)
  textInput.value = ''
}

function onSending(item) {
  const i = uploading.value.findIndex((x) => x.id === item.id)
  if (i >= 0) uploading.value[i] = item
  else uploading.value.push(item)
}

function onSent(item) {
  const i = uploading.value.findIndex((x) => x.id === item.id)
  if (i >= 0) uploading.value.splice(i, 1)
  pushFile({ name: item.name, size: item.size })
}

function startPeer() {
  stopPeer()
  peerTimer = setInterval(() => {
    const k = transfer.activeRoom
    if (!k) return
    const dice = Math.random()
    if (dice < 0.7) {
      peerText(k, autoTexts[Math.floor(Math.random() * autoTexts.length)])
    } else {
      peerFile(k, `对端文件_${Math.floor(Math.random() * 99) + 1}.zip`, (Math.random() * 2 + 0.2) * 1024 * 1024)
    }
  }, 15000)
}

function stopPeer() {
  if (peerTimer) clearInterval(peerTimer)
  peerTimer = null
}

function startAmbient() {
  ambientTimer = setInterval(() => {
    if (inRoom.value || knownRooms.value.length === 0) return
    const k = knownRooms.value[Math.floor(Math.random() * knownRooms.value.length)]
    peerText(k, autoTexts[Math.floor(Math.random() * autoTexts.length)])
  }, 18000)
}

onMounted(() => {
  if (inRoom.value) startPeer()
  startAmbient()
})
onUnmounted(() => {
  stopPeer()
  if (ambientTimer) clearInterval(ambientTimer)
})
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <div class="mb-6">
      <h1 class="text-2xl">文件中转</h1>
      <p class="muted mt-1 text-[13px]">
        密钥房间配对 · 文本粘贴 · 小文件直传（≤10MB 占位）
      </p>
    </div>

    <!-- 加入房间 -->
    <div v-if="!inRoom" class="glass p-6">
      <form class="flex flex-col gap-3" @submit.prevent="join">
        <div class="flex flex-col gap-3 sm:flex-row">
          <input
            v-model="keyInput"
            class="input flex-1 font-mono"
            placeholder="输入 ≥6 位数字密钥，创建 / 加入房间"
            :disabled="!isLoggedIn()"
          />
          <button class="btn btn-primary shrink-0" :disabled="!keyOk || !isLoggedIn()">
            {{ keyInput ? '创建 / 加入' : '请输入密钥' }}
          </button>
        </div>
        <p class="muted text-[11px]">
          {{ keyOk ? '✓ 密钥合法，创建或加入该房间' : '密钥需为至少 6 位数字（如 123456）' }}
        </p>
      </form>

      <div v-if="knownRooms.length" class="mt-5">
        <p class="muted mb-2 text-[12px]">历史房间（localStorage 持久化）</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="k in knownRooms"
            :key="k"
            class="chip"
            @click="joinExisting(k)"
          >
            🔑 {{ k }}
            <span
              v-if="(transfer.unread[k] || 0) > 0"
              class="badge !min-w-[16px] !h-4 !text-[10px]"
            >
              {{ transfer.unread[k] }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 房间内 -->
    <div v-else class="glass flex h-[62vh] flex-col overflow-hidden">
      <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div class="flex items-center gap-2">
          <span class="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#b06bff] to-[#6d8dff] text-xs font-bold text-white">
            🔑
          </span>
          <div>
            <div class="text-[14px] font-semibold text-[--text-h]">房间 {{ transfer.activeRoom }}</div>
            <div class="text-[11px] text-[--ok]">● 配对成功（模拟会话）</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="quit">退出房间</button>
      </div>

      <div class="flex gap-1 border-b border-white/10 px-3 pt-2">
        <button
          class="btn btn-sm rounded-b-none"
          :class="tab === 'text' ? '!border-transparent !bg-white/10 !text-[--text-h]' : 'btn-ghost'"
          @click="tab = 'text'"
        >
          文本粘贴
        </button>
        <button
          class="btn btn-sm rounded-b-none"
          :class="tab === 'file' ? '!border-transparent !bg-white/10 !text-[--text-h]' : 'btn-ghost'"
          @click="tab = 'file'"
        >
          小文件直传
        </button>
        <div class="flex-1" />
        <span class="pb-1 pr-2 text-[11px] text-[--text-mute]">
          文本 {{ room?.texts.length || 0 }} · 文件 {{ room?.files.length || 0 }}
        </span>
      </div>

      <div class="flex-1 space-y-3 overflow-y-auto p-4">
        <!-- 文本流 -->
        <template v-if="tab === 'text'">
          <div
            v-for="t in room?.texts || []"
            :key="t.id"
            class="flex"
            :class="t.self ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[80%] px-3.5 py-2"
              :class="
                t.self
                  ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-[#b06bff] to-[#8a54e8] text-white'
                  : 'glass !rounded-2xl !rounded-bl-md'
              "
            >
              <div class="mb-0.5 text-[11px]" :class="t.self ? 'text-white/70' : 'text-[--text-mute]'">
                {{ t.author }}<span class="dot-sep">·</span>{{ timeAgo(t.time) }}
              </div>
              <div class="whitespace-pre-wrap text-[13px] leading-relaxed">{{ t.body }}</div>
            </div>
          </div>
          <div v-if="!(room?.texts || []).length" class="muted pt-6 text-center text-[13px]">
            还没有文本内容，粘贴一段发送吧
          </div>
        </template>

        <!-- 文件流 -->
        <template v-else>
          <div
            v-for="f in room?.files || []"
            :key="f.id"
            class="glass !rounded-xl flex items-center gap-3 p-3"
          >
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/[0.07] text-lg">
              {{ f.name.endsWith('.zip') ? '🗜️' : f.name.endsWith('.pdf') ? '📄' : '📎' }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="truncate text-[13px] font-medium text-[--text-h]">{{ f.name }}</div>
              <div class="muted text-[11px]">
                {{ f.author }} · {{ fmtSize(f.size) }} · {{ timeAgo(f.time) }}
              </div>
            </div>
            <span class="shrink-0 text-[11px] text-[--ok]">✓ 已到达</span>
          </div>

          <div v-for="u in uploading" :key="u.id" class="glass !rounded-xl p-3">
            <div class="mb-2 flex items-center justify-between text-[12px]">
              <span class="truncate font-medium text-[--text-h]">{{ u.name }}</span>
              <span class="muted">{{ u.progress }}%</span>
            </div>
            <div class="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                class="h-full rounded-full bg-gradient-to-r from-[#6d8dff] to-[#b06bff] transition-all duration-200"
                :style="{ width: u.progress + '%' }"
              />
            </div>
          </div>

          <div v-if="!(room?.files || []).length && !uploading.length" class="pt-6">
            <UploadBox @sending="onSending" @sent="onSent" />
          </div>
        </template>
      </div>

      <!-- 输入区 -->
      <div v-if="tab === 'text'" class="border-t border-white/10 p-3">
        <form class="flex items-center gap-2" @submit.prevent="sendText">
          <input
            v-model="textInput"
            class="input flex-1"
            placeholder="粘贴文本，Enter / 按钮发送到房间"
          />
          <button class="btn btn-primary shrink-0" :disabled="!textInput.trim()">发送</button>
        </form>
      </div>
      <div v-else class="border-t border-white/10 p-3">
        <UploadBox v-if="!uploading.length" @sending="onSending" @sent="onSent" />
        <p v-else class="muted py-2 text-center text-[12px]">正在上传，完成后自动写入会话…</p>
      </div>
    </div>
  </div>
</template>
