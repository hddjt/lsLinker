<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import SiteCard from '../components/SiteCard.vue'
import SiteFormModal from '../components/SiteFormModal.vue'
import BaseModal from '../components/BaseModal.vue'
import { useSites, deleteSite } from '../stores/sites'
import { isLoggedIn } from '../stores/auth'
import { useSiteFilter } from '../composables/useSiteFilter'

const { categories, sites } = useSites()
const { kw, activeCat, filtered, grouped, catCounts, isEmpty, noMatch } = useSiteFilter(sites, categories)
const route = useRoute()

const loggedIn = computed(isLoggedIn)
const showForm = ref(false)
const editing = ref(null)
const showDel = ref(false)
const pendingDelete = ref(null)

function openAdd() {
  editing.value = null
  showForm.value = true
}

function openEdit(site) {
  editing.value = site
  showForm.value = true
}

function askDelete(site) {
  pendingDelete.value = site
  showDel.value = true
}

function confirmDelete() {
  if (pendingDelete.value) deleteSite(pendingDelete.value.id)
  pendingDelete.value = null
  showDel.value = false
}

watch(
  () => route.query.cat,
  (cat) => {
    const id = String(cat || 'all')
    activeCat.value = id === 'all' || categories.some((c) => c.id === id) ? id : 'all'
  },
  { immediate: true },
)
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
            class="input !pr-9 !pl-9"
            placeholder="搜索站点 / 描述 / 链接 / 分类"
          />
          <button
            v-if="kw"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-60 hover:opacity-100"
            title="清除"
            @click="kw = ''"
          >
            ✕
          </button>
        </div>
        <button
          class="btn btn-primary shrink-0"
          :disabled="!loggedIn"
          :title="loggedIn ? '新增站点' : '请先登录'"
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
        {{ c.name }} <span class="opacity-60">{{ catCounts[c.id] ?? 0 }}</span>
      </button>
    </div>

    <div v-if="isEmpty" class="glass p-10 text-center text-[--text-mute]">
      <div class="mb-2 text-3xl">🗂️</div>
      还没有站点，点击右上角「新增」开始收藏
    </div>

    <div v-else-if="noMatch" class="glass p-10 text-center text-[--text-mute]">
      <div class="mb-2 text-3xl">🫥</div>
      没有找到匹配的站点
    </div>

    <div v-for="g in grouped" :key="g.cat?.id || 'all'" class="mb-8">
      <div class="mb-3 flex items-center gap-2">
        <h2 class="text-[15px] font-semibold text-[--text-h]">{{ g.cat?.name || '未分类' }}</h2>
        <span class="muted text-[12px]">{{ g.list.length }} 个</span>
        <span class="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <SiteCard
          v-for="s in g.list"
          :key="s.id"
          :site="s"
          @edit="openEdit"
          @delete="askDelete"
        />
      </div>
    </div>

    <SiteFormModal :open="showForm" :editing="editing" @close="showForm = false" />

    <BaseModal
      :open="showDel"
      :title="pendingDelete ? `删除站点「${pendingDelete.name}」？` : ''"
      @close="showDel = false"
    >
      <p class="text-[13px] text-[--text-mute]">该操作不可恢复，确定删除吗？</p>
      <div class="mt-4 flex justify-end gap-2">
        <button class="btn btn-ghost" @click="showDel = false">取消</button>
        <button class="btn btn-primary !bg-[--danger]" @click="confirmDelete">删除</button>
      </div>
    </BaseModal>
  </div>
</template>
