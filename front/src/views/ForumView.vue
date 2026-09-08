<script setup>
import { ref, computed, nextTick } from 'vue'
import PostFormModal from '../components/PostFormModal.vue'
import {
  usePosts,
  addReply,
  likePost,
  isLiked,
  repliesOf,
  deletePost,
  myPosts,
  myReplies,
} from '../stores/posts'
import { togglePost, isPostFav } from '../stores/favorites'
import { isLoggedIn, currentUser } from '../stores/auth'
import { timeAgo } from '../utils/storage'

const { posts } = usePosts()
const filter = ref('all')
const selected = ref(null)
const showForm = ref(false)
const replyText = ref('')
const replySent = ref(false)

const list = computed(() => {
  if (filter.value === 'mine') return myPosts()
  if (filter.value === 'replied') return myReplies()
  return posts
})

const activeReplies = computed(() => (selected.value ? repliesOf(selected.value.id) : []))

function openPost(p) {
  selected.value = p
  replySent.value = false
}

function back() {
  selected.value = null
  replyText.value = ''
}

function submitReply() {
  if (!replyText.value.trim()) return
  addReply(selected.value.id, replyText.value)
  replyText.value = ''
  replySent.value = true
  nextTick(() => {
    const el = document.querySelector('.reply-ok')
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function onDeletePost(p) {
  if (confirm(`确定删除帖子「${p.title}」？`)) {
    deletePost(p.id)
    if (selected.value?.id === p.id) back()
  }
}
</script>

<template>
  <div>
    <!-- 列表 -->
    <div v-if="!selected">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl">论坛</h1>
          <p class="muted mt-1 text-[13px]">发帖 · 回帖 · 点赞</p>
        </div>
        <button class="btn btn-primary shrink-0" :disabled="!isLoggedIn()" @click="showForm = true">
          ✎ 发新帖
        </button>
      </div>

      <div class="mb-5 flex gap-2">
        <button class="chip" :class="{ active: filter === 'all' }" @click="filter = 'all'">
          全部帖子
        </button>
        <button class="chip" :class="{ active: filter === 'mine' }" @click="filter = 'mine'">
          我的帖子
        </button>
        <button class="chip" :class="{ active: filter === 'replied' }" @click="filter = 'replied'">
          我的回复
        </button>
      </div>

      <div v-if="list.length === 0" class="glass p-10 text-center text-[--text-mute]">
        <div class="mb-2 text-3xl">🗒️</div>
        这里还没有帖子
      </div>

      <div class="flex flex-col gap-3">
        <div
          v-for="p in list"
          :key="p.id"
          class="glass glass-hover cursor-pointer p-4"
          @click="openPost(p)"
        >
          <div class="flex items-start justify-between gap-3">
            <h2 class="text-[15px] font-semibold text-[--text-h]">{{ p.title }}</h2>
            <span
              class="btn btn-ghost btn-icon btn-sm shrink-0"
              :class="isPostFav(p.id) ? '!text-amber-300' : 'text-[--text-mute]'"
              @click.stop="togglePost(p.id)"
            >
              {{ isPostFav(p.id) ? '★' : '☆' }}
            </span>
          </div>
          <p class="muted mt-1 line-clamp-2 whitespace-pre-wrap text-[13px]">
            {{ p.body }}
          </p>
          <div class="mt-3 flex items-center gap-2 text-[12px] text-[--text-mute]">
            <span class="font-medium text-[#8fa6ff]">{{ p.author }}</span>
            <span class="dot-sep">·</span>
            <span>{{ timeAgo(p.time) }}</span>
            <span class="dot-sep">·</span>
            <span>👍 {{ p.likes }}</span>
            <span class="dot-sep">·</span>
            <span>💬 {{ repliesOf(p.id).length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情 -->
    <div v-else>
      <div class="mb-4">
        <button class="btn btn-ghost btn-sm" @click="back">← 返回列表</button>
      </div>

      <div class="glass p-6">
        <div class="mb-3 flex items-start justify-between gap-3">
          <h1 class="text-xl leading-snug">{{ selected.title }}</h1>
          <button
            v-if="selected.author === currentUser().nickname"
            class="btn btn-ghost btn-icon btn-sm !text-[--danger]"
            title="删除帖子"
            @click="onDeletePost(selected)"
          >
            ✕
          </button>
        </div>
        <div class="mb-5 flex flex-wrap items-center gap-2 text-[12px] text-[--text-mute]">
          <span class="font-medium text-[#8fa6ff]">{{ selected.author }}</span>
          <span class="dot-sep">·</span>
          <span>{{ timeAgo(selected.time) }}</span>
          <span class="dot-sep">·</span>
          <span>💬 {{ activeReplies.length }} 条回复</span>
        </div>
        <p class="whitespace-pre-wrap text-[14px] leading-relaxed text-[--text]">
          {{ selected.body }}
        </p>
        <div class="mt-5 flex items-center gap-2">
          <button
            class="btn"
            :class="isLiked(selected.id) ? '!border-transparent !bg-[#b06bff]/25 !text-[--text-h]' : ''"
            @click="likePost(selected.id)"
          >
            {{ isLiked(selected.id) ? '👍 已赞' : '👍 点赞' }}
            <span class="opacity-70">{{ selected.likes }}</span>
          </button>
          <button
            class="btn"
            :class="isPostFav(selected.id) ? '!text-amber-300' : ''"
            @click="togglePost(selected.id)"
          >
            {{ isPostFav(selected.id) ? '★ 已收藏' : '☆ 收藏' }}
          </button>
        </div>
      </div>

      <div class="mt-6">
        <h3 class="mb-3 text-[15px] font-semibold text-[--text-h]">
          回复（{{ activeReplies.length }}）
        </h3>
        <div class="flex flex-col gap-3">
          <div v-for="r in activeReplies" :key="r.id" class="glass p-4">
            <div class="mb-1.5 flex items-center gap-2 text-[12px] text-[--text-mute]">
              <span class="font-medium text-[#8fa6ff]">{{ r.author }}</span>
              <span class="dot-sep">·</span>
              <span>{{ timeAgo(r.time) }}</span>
            </div>
            <p class="whitespace-pre-wrap text-[14px]">{{ r.body }}</p>
          </div>
          <div v-if="activeReplies.length === 0" class="glass p-6 text-center text-[13px] text-[--text-mute]">
            暂无回复，来说两句吧
          </div>
        </div>

        <div class="glass mt-4 p-4">
          <template v-if="isLoggedIn()">
            <textarea
              v-model="replyText"
              class="input !min-h-[80px]"
              placeholder="写下你的回复…"
            />
            <div class="mt-3 flex justify-end">
              <button class="btn btn-primary" :disabled="!replyText.trim()" @click="submitReply">
                发表回复
              </button>
            </div>
            <div v-if="replySent" class="reply-ok muted mt-2 text-right text-[12px] text-[--ok]">
              ✓ 已回复
            </div>
          </template>
          <p v-else class="muted text-center text-[13px]">请先登录后再回复</p>
        </div>
      </div>
    </div>

    <PostFormModal :open="showForm" @close="showForm = false" />
  </div>
</template>
