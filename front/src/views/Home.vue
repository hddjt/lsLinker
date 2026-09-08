<template>
  <div>
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl">网址导航</h1>
        <p class="muted mt-1 text-[13px]">常用站点 · 快速访问 · 分类管理</p>
      </div>
      <div class="flex items-center gap-2">
        <SearchInput v-model="kw" placeholder="搜索站点 / 描述 / 链接 / 分类" />
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

    <CategoryFilter v-model="activeCat" :categories="categories" :counts="catCounts" :total="sites.length" />

    <EmptyState v-if="isEmpty" text="还没有站点，点击右上角「新增」开始收藏" />

    <EmptyState v-else-if="noMatch" icon="🫥" text="没有找到匹配的站点" />

    <SiteGroupList v-else :grouped="grouped" @edit="openEdit" @delete="askDelete" />

    <SiteFormModal :open="showForm" :editing="editing" @close="showForm = false" />

    <DeleteConfirmModal
      :open="showDel"
      :site="pendingDelete"
      @confirm="confirmDelete"
      @close="showDel = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import SiteFormModal from '../components/SiteFormModal.vue'
import SearchInput from '../components/SearchInput.vue'
import CategoryFilter from '../components/CategoryFilter.vue'
import EmptyState from '../components/EmptyState.vue'
import SiteGroupList from '../components/SiteGroupList.vue'
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue'
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