import { reactive } from 'vue'
import { readLS, writeLS, uid, normalizeUrl } from '../utils/storage'

const DEFAULT_CATEGORIES = [
  { id: 'c_dev', name: '开发' },
  { id: 'c_tools', name: '工具' },
  { id: 'c_docs', name: '文档' },
  { id: 'c_news', name: '资讯' },
]

const DEFAULT_SITES = [
  { id: 's_1', name: 'GitHub', url: 'https://github.com', desc: '全球最大的代码托管平台', category: 'c_dev', clicks: 128, createdAt: Date.now() - 8.64e7 * 30 },
  { id: 's_2', name: 'MDN', url: 'https://developer.mozilla.org', desc: 'Web 开发权威文档', category: 'c_docs', clicks: 96, createdAt: Date.now() - 8.64e7 * 27 },
  { id: 's_3', name: 'Stack Overflow', url: 'https://stackoverflow.com', desc: '程序员问答社区', category: 'c_dev', clicks: 201, createdAt: Date.now() - 8.64e7 * 25 },
  { id: 's_4', name: 'Excalidraw', url: 'https://excalidraw.com', desc: '手绘风格在线白板', category: 'c_tools', clicks: 44, createdAt: Date.now() - 8.64e7 * 20 },
  { id: 's_5', name: 'Hacker News', url: 'https://news.ycombinator.com', desc: '科技创业新闻聚合', category: 'c_news', clicks: 73, createdAt: Date.now() - 8.64e7 * 15 },
  { id: 's_6', name: 'Can I Use', url: 'https://caniuse.com', desc: '浏览器特性兼容性查询', category: 'c_tools', clicks: 58, createdAt: Date.now() - 8.64e7 * 12 },
  { id: 's_7', name: 'Vite', url: 'https://vitejs.dev', desc: '下一代前端构建工具', category: 'c_docs', clicks: 39, createdAt: Date.now() - 8.64e7 * 8 },
  { id: 's_8', name: 'V2EX', url: 'https://v2ex.com', desc: '创意工作者的社区', category: 'c_news', clicks: 111, createdAt: Date.now() - 8.64e7 * 5 },
]

const state = reactive({
  categories: readLS('categories', DEFAULT_CATEGORIES),
  sites: readLS('sites', DEFAULT_SITES),
})

function persist() {
  writeLS('categories', state.categories)
  writeLS('sites', state.sites)
}

export function addSite({ name, url, desc, category }) {
  const site = {
    id: uid('s'),
    name: name.trim(),
    url: normalizeUrl(url),
    desc: desc.trim(),
    category,
    clicks: 0,
    createdAt: Date.now(),
  }
  state.sites.unshift(site)
  persist()
  return site
}

export function updateSite(id, patch) {
  const s = state.sites.find((x) => x.id === id)
  if (!s) return
  Object.assign(s, patch)
  if (patch.url) s.url = normalizeUrl(patch.url)
  persist()
}

export function deleteSite(id) {
  state.sites = state.sites.filter((x) => x.id !== id)
  persist()
}

export function addClick(id) {
  const s = state.sites.find((x) => x.id === id)
  if (s) {
    s.clicks += 1
    persist()
  }
}

export function categoryById(id) {
  return state.categories.find((c) => c.id === id)
}

export function useSites() {
  return state
}
