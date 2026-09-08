<script setup>
import { computed, ref, watch } from 'vue'
import { siteIcon, timeAgo } from '../utils/storage'
import { addClick } from '../stores/sites'
import { isSiteFav, toggleSite } from '../stores/favorites'
import { categoryById } from '../stores/sites'

const props = defineProps({
  site: { type: Object, required: true },
})
const emit = defineEmits(['edit', 'delete'])

const cat = computed(() => categoryById(props.site.category))
const iconSrc = computed(() => props.site.icon || siteIcon(props.site.url))
const imgFailed = ref(false)

watch(
  () => [props.site.icon, props.site.url],
  () => {
    imgFailed.value = false
  },
)
</script>

<template>
  <div class="glass tilt flex flex-col gap-3 p-4" v-tilt :data-tilt="8" :data-tilt-shadow="22">
    <div class="flex items-start gap-3">
      <div class="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.07] ring-1 ring-white/10">
        <img
          v-if="iconSrc && !imgFailed"
          :src="iconSrc"
          alt=""
          class="h-6 w-6 object-contain"
          loading="lazy"
          @error="imgFailed = true"
        />
        <span v-else class="text-sm font-bold text-[--text-h]">
          {{ site.name[0] }}
        </span>
      </div>
      <div class="min-w-0 flex-1">
        <a
          :href="site.url"
          target="_blank"
          rel="noopener"
          class="block truncate text-[15px] font-semibold text-[--text-h] transition-colors hover:text-[--primary]"
          @click="addClick(site.id)"
        >
          {{ site.name }}
        </a>
        <p class="mt-0.5 line-clamp-2 text-[12px] leading-snug text-[--text-mute]">
          {{ site.desc }}
        </p>
      </div>
      <button
        class="btn btn-icon btn-sm shrink-0"
        :class="isSiteFav(site.id) ? '!text-amber-300' : 'text-[--text-mute]'"
        :title="isSiteFav(site.id) ? '取消收藏' : '收藏'"
        @click="toggleSite(site.id)"
      >
        {{ isSiteFav(site.id) ? '★' : '☆' }}
      </button>
    </div>

    <div class="flex items-center justify-between text-[11px] text-[--text-mute]">
      <span class="flex items-center gap-1.5">
        <span v-if="cat" class="chip !cursor-default !py-0.5">{{ cat.name }}</span>
        <span>{{ timeAgo(site.createdAt) }}</span>
      </span>
      <div class="flex items-center gap-1">
        <span class="flex items-center gap-1" title="点击次数">👁 {{ site.clicks }}</span>
        <button class="btn btn-ghost btn-icon btn-sm" title="编辑" @click="emit('edit', site)">✎</button>
        <button class="btn btn-ghost btn-icon btn-sm !text-[--danger]" title="删除" @click="emit('delete', site)">✕</button>
      </div>
    </div>
  </div>
</template>
