<script setup>
import { ref, computed } from 'vue'
import SiteCard from '../components/SiteCard.vue'
import SiteFormModal from '../components/SiteFormModal.vue'
import { useSites, deleteSite } from '../stores/sites'
import { isLoggedIn } from '../stores/auth'

const { categories, sites } = useSites()
const kw = ref('')
const activeCat = ref('all')
const showForm = ref(false)
const editing = ref(null)

const filtered = computed(() => {
  const q = kw.value.trim().toLowerCase()
  return sites.filter((s) => {
    const matchCat = activeCat.value === 'all' || s.category === activeCat.value
    const matchKw =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      s.url.toLowerCase().includes(q)
    return matchCat && matchKw
  })
})

const grouped = computed(() => {
  if (activeCat.value !== 'all') {
    return [{ cat: categories.find((c) => c.id === activeCat.value), list: filtered.value }]
  }
  return categories
    .map((c) => ({ cat: c, list: filtered.value.filter((s) => s.category === c.id) }))
    .filter((g) => g.list.length)
})

const catCount = (id) => sites.filter((s) => s.category === id).length

function openAdd() {
  editing.value = null
  showForm.value = true
}

function openEdit(site) {
  editing.value = site
  showForm.value = true
}

function onDelete(site) {
  if (confirm(`确定删除站点「${site.name}」？`)) deleteSite(site.id)
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl">网址导航</h1>
        <p class="muted mt-1 text-[13px]">常用站点 · 快速访问 · 分类管理</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60">🔍</span>
          <input
            v-model="kw"
            class="input !pl-9"
            placeholder="搜索站点 / 描述 / 链接"
          />
        </div>
        <button
          class="btn btn-primary shrink-0"
          :disabled="!isLoggedIn()"
          :title="isLoggedIn() ? '新增站点' : '请先登录'"
          @click="openAdd"
        >
          ＋ 新增
        </button>
      </div>
    </div>

    <div class="mb-6 flex flex-wrap items-center gap-2">
      <button
        class="chip"
        :class="{ active: activeCat === 'all' }"
        @click="activeCat = 'all'"
      >
        全部 <span class="opacity-60">{{ sites.length }}</span>
      </button>
      <button
        v-for="c in categories"
        :key="c.id"
        class="chip"
        :class="{ active: activeCat === c.id }"
        @click="activeCat = c.id"
      >
        {{ c.name }} <span class="opacity-60">{{ catCount(c.id) }}</span>
      </button>
    </div>

    <div v-if="filtered.length === 0" class="glass p-10 text-center text-[--text-mute]">
      <div class="mb-2 text-3xl">🫥</div>
      没有找到匹配的站点
    </div>

    <div v-for="g in grouped" :key="g.cat?.id || 'all'" class="mb-8">
      <div class="mb-3 flex items-center gap-2">
        <h2 class="text-[15px] font-semibold text-[--text-h]">{{ g.cat?.name || '未分类' }}</h2>
        <span class="muted text-[12px]">{{ g.list.length }} 个</span>
        <span class="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SiteCard
          v-for="s in g.list"
          :key="s.id"
          :site="s"
          @edit="openEdit"
          @delete="onDelete"
        />
      </div>
    </div>

    <SiteFormModal :open="showForm" :editing="editing" @close="showForm = false" />
  </div>
</template>
