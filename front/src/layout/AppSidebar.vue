<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useSites } from '../stores/sites'
import { usePosts } from '../stores/posts'
import { useFavorites } from '../stores/favorites'
import { totalUnread as chatUnread } from '../stores/chat'
import { totalUnread as transferUnread } from '../stores/transfer'

const route = useRoute()
const { categories, sites } = useSites()
const { posts } = usePosts()
const favorites = useFavorites()

const catCounts = computed(() => {
  const counts = {}
  for (const site of sites) counts[site.category] = (counts[site.category] || 0) + 1
  return counts
})

const sections = computed(() => [
  { to: '/forum', icon: '💬', label: '论坛', count: posts.length },
  { to: '/favorites', icon: '★', label: '收藏', count: favorites.siteIds.length + favorites.postIds.length },
  { to: '/chat', icon: '◔', label: '聊天', count: chatUnread() },
  { to: '/transfer', icon: '⇄', label: '中转', count: transferUnread() },
])

function isCategoryActive(id) {
  return route.path === '/' && String(route.query.cat || 'all') === id
}
</script>

<template>
  <aside class="hidden lg:block">
    <div class="glass sticky top-28 min-h-[460px] p-5">
      <div class="mb-4 text-[13px] font-semibold text-[--text-mute]">分类</div>

      <div class="space-y-1.5">
        <RouterLink
          :to="{ path: '/', query: { cat: 'all' } }"
          class="sidebar-item"
          :class="{ active: isCategoryActive('all') }"
        >
          <span class="sidebar-icon">◎</span>
          <span class="flex-1">全部</span>
          <span class="sidebar-count">{{ sites.length }}</span>
        </RouterLink>

        <RouterLink
          v-for="category in categories"
          :key="category.id"
          :to="{ path: '/', query: { cat: category.id } }"
          class="sidebar-item"
          :class="{ active: isCategoryActive(category.id) }"
        >
          <span class="sidebar-icon">◆</span>
          <span class="flex-1">{{ category.name }}</span>
          <span class="sidebar-count">{{ catCounts[category.id] || 0 }}</span>
        </RouterLink>
      </div>

      <div class="my-5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div class="mb-3 text-[13px] font-semibold text-[--text-mute]">模块</div>
      <div class="space-y-1.5">
        <RouterLink
          v-for="section in sections"
          :key="section.to"
          :to="section.to"
          class="sidebar-item"
          :class="{ active: route.path === section.to }"
        >
          <span class="sidebar-icon">{{ section.icon }}</span>
          <span class="flex-1">{{ section.label }}</span>
          <span v-if="section.count" class="sidebar-count">{{ section.count }}</span>
        </RouterLink>
      </div>

      <RouterLink
        to="/about"
        class="mt-5 flex items-center justify-between rounded-2xl border border-[--line] bg-[--field-bg] px-4 py-3 text-[13px] text-[--text-mute] transition hover:border-[--line-strong] hover:text-[--text-h]"
      >
        <span>关于 lsLinker</span>
        <span>›</span>
      </RouterLink>
    </div>
  </aside>
</template>
