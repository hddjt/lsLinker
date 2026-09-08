<script setup>
import { ref } from 'vue'
import SiteCard from '../components/SiteCard.vue'
import { favSites, favPosts, toggleSite, togglePost } from '../stores/favorites'
import { deleteSite } from '../stores/sites'
import { repliesOf, deletePost } from '../stores/posts'
import { timeAgo } from '../utils/storage'

const tab = ref('sites')

function onDeleteSite(site) {
  if (confirm(`确定删除站点「${site.name}」？（将同时取消收藏）`)) {
    toggleSite(site.id)
    deleteSite(site.id)
  }
}

function onDeletePost(p) {
  if (confirm(`确定删除帖子「${p.title}」？（将同时取消收藏）`)) {
    togglePost(p.id)
    deletePost(p.id)
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl">我的收藏</h1>
      <p class="muted mt-1 text-[13px]">收藏的站点与帖子，集中管理</p>
    </div>

    <div class="mb-5 flex gap-2">
      <button class="chip" :class="{ active: tab === 'sites' }" @click="tab = 'sites'">
        站点收藏 <span class="opacity-60">{{ favSites().length }}</span>
      </button>
      <button class="chip" :class="{ active: tab === 'posts' }" @click="tab = 'posts'">
        帖子收藏 <span class="opacity-60">{{ favPosts().length }}</span>
      </button>
    </div>

    <div v-if="tab === 'sites'">
      <div v-if="favSites().length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SiteCard
          v-for="s in favSites()"
          :key="s.id"
          :site="s"
          @delete="onDeleteSite"
        />
      </div>
      <div v-else class="glass p-10 text-center text-[--text-mute]">
        <div class="mb-2 text-3xl">☆</div>
        还没有收藏任何站点，去导航页逛逛吧
      </div>
    </div>

    <div v-else>
      <div v-if="favPosts().length" class="flex flex-col gap-3">
        <div v-for="p in favPosts()" :key="p.id" class="glass glass-hover p-4">
          <div class="flex items-start justify-between gap-3">
            <h2 class="text-[15px] font-semibold text-[--text-h]">{{ p.title }}</h2>
            <button class="btn btn-ghost btn-icon btn-sm shrink-0 !text-[--danger]" title="取消收藏并删除" @click="onDeletePost(p)">
              ✕
            </button>
          </div>
          <p class="muted mt-1 line-clamp-2 whitespace-pre-wrap text-[13px]">{{ p.body }}</p>
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
      <div v-else class="glass p-10 text-center text-[--text-mute]">
        <div class="mb-2 text-3xl">★</div>
        还没有收藏任何帖子，去论坛逛逛吧
      </div>
    </div>
  </div>
</template>
