<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import {
  useChat,
  enterRoom,
  leaveRoom,
  sendMessage,
  incomingMessage,
  messagesOf,
  totalUnread,
} from '../stores/chat'
import { isLoggedIn } from '../stores/auth'
import { timeAgo } from '../utils/storage'

const chat = useChat()
const keyInput = ref('')
const textInput = ref('')
const msgBox = ref(null)
let peerTimer = null
let ambientTimer = null

const inRoom = computed(() => !!chat.activeRoom)
const msgs = computed(() => (chat.activeRoom ? messagesOf(chat.activeRoom) : []))
const knownRooms = computed(() => Object.keys(chat.rooms))

function join() {
  if (!keyInput.value.trim()) return
  enterRoom(keyInput.value)
  keyInput.value = ''
  scrollDown()
  startPeer()
}

function joinExisting(k) {
  enterRoom(k)
  startPeer()
  scrollDown()
}

function leave() {
  leaveRoom()
  textInput.value = ''
  stopPeer()
}

function submit() {
  if (!textInput.value.trim()) return
  sendMessage(textInput.value)
  textInput.value = ''
  scrollDown()
}

function scrollDown() {
  nextTick(() => {
    msgBox.value?.scrollTo({ top: msgBox.value.scrollHeight })
  })
}

const autoReplies = [
  '收到！',
  '这个想法不错 👍',
  '嗯，我也这么觉得。',
  '可以详细说说吗？',
  '正在摸鱼中…',
]

function startPeer() {
  stopPeer()
  peerTimer = setInterval(() => {
    const room = chat.activeRoom
    if (!room) return
    const text = autoReplies[Math.floor(Math.random() * autoReplies.length)]
    incomingMessage(room, text, '房间助手')
    scrollDown()
  }, 9000)
}

function stopPeer() {
  if (peerTimer) clearInterval(peerTimer)
  peerTimer = null
}

// 离开房间时模拟其它房间来消息，驱动顶栏未读红点
function startAmbient() {
  ambientTimer = setInterval(() => {
    if (inRoom.value || knownRooms.value.length === 0) return
    const target = knownRooms.value[Math.floor(Math.random() * knownRooms.value.length)]
    const text = autoReplies[Math.floor(Math.random() * autoReplies.length)]
    incomingMessage(target, text, '房间助手')
  }, 14000)
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
      <h1 class="text-2xl">实时聊天</h1>
      <p class="muted mt-1 text-[13px]">
        {{ isLoggedIn() ? '输入房间 ID / 密钥进入，与你圈子的人实时对话' : '请先登录再聊天' }}
      </p>
    </div>

    <!-- 加入房间 -->
    <div v-if="!inRoom" class="glass p-6">
      <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="join">
        <input
          v-model="keyInput"
          class="input flex-1"
          placeholder="输入房间 ID / 密钥（如 code-0826）"
          :disabled="!isLoggedIn()"
        />
        <button class="btn btn-primary shrink-0" :disabled="!keyInput.trim() || !isLoggedIn()">
          进入房间
        </button>
      </form>

      <div v-if="knownRooms.length" class="mt-5">
        <p class="muted mb-2 text-[12px]">最近进入过的房间</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="k in knownRooms"
            :key="k"
            class="chip"
            :class="{ active: false }"
            @click="joinExisting(k)"
          >
            🏠 {{ k }}
            <span
              v-if="(chat.unread[k] || 0) > 0"
              class="badge !min-w-[16px] !h-4 !text-[10px]"
            >
              {{ chat.unread[k] }}
            </span>
          </button>
        </div>
      </div>

      <p v-if="!isLoggedIn()" class="muted mt-4 text-center text-[13px]">请先在右上角登录</p>
    </div>

    <!-- 房间内 -->
    <div v-else class="glass flex h-[60vh] flex-col overflow-hidden">
      <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div class="flex items-center gap-2">
          <span class="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#6d8dff] to-[#b06bff] text-xs font-bold text-white">
            C
          </span>
          <div>
            <div class="text-[14px] font-semibold text-[--text-h]">房间 {{ chat.activeRoom }}</div>
            <div class="text-[11px] text-[--ok]">● 在线（模拟）</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="leave">离开房间</button>
      </div>

      <div ref="msgBox" class="flex-1 space-y-3 overflow-y-auto p-4">
        <div
          v-for="m in msgs"
          :key="m.id"
          class="flex"
          :class="m.system ? 'justify-center' : m.self ? 'justify-end' : 'justify-start'"
        >
          <div
            v-if="m.system"
            class="rounded-full bg-white/5 px-3 py-1 text-[11px] text-[--text-mute]"
          >
            {{ m.body }}
          </div>
          <div
            v-else
            class="max-w-[75%] px-3.5 py-2"
            :class="
              m.self
                ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-[#6d8dff] to-[#5a76e8] text-white'
                : 'glass !rounded-2xl !rounded-bl-md'
            "
          >
            <div class="mb-0.5 text-[11px]" :class="m.self ? 'text-white/70' : 'text-[--text-mute]'">
              {{ m.author }}<span class="dot-sep">·</span>{{ timeAgo(m.time) }}
            </div>
            <div class="text-[13px] leading-relaxed">{{ m.body }}</div>
          </div>
        </div>
      </div>

      <form class="flex items-center gap-2 border-t border-white/10 p-3" @submit.prevent="submit">
        <input
          v-model="textInput"
          class="input flex-1"
          placeholder="输入消息，Enter 发送"
        />
        <button class="btn btn-primary shrink-0" :disabled="!textInput.trim()">发送</button>
      </form>
    </div>
  </div>
</template>
