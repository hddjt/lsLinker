import { reactive } from 'vue'
import { readLS, writeLS } from '../utils/storage'
import { useSites } from './sites'
import { usePosts } from './posts'

const state = reactive({
  siteIds: readLS('favorites', null)?.sites || [],
  postIds: readLS('favorites', null)?.posts || [],
})

function persist() {
  writeLS('favorites', { sites: state.siteIds, posts: state.postIds })
}

export function toggleSite(id) {
  const i = state.siteIds.indexOf(id)
  if (i >= 0) state.siteIds.splice(i, 1)
  else state.siteIds.push(id)
  persist()
}

export function togglePost(id) {
  const i = state.postIds.indexOf(id)
  if (i >= 0) state.postIds.splice(i, 1)
  else state.postIds.push(id)
  persist()
}

export function isSiteFav(id) {
  return state.siteIds.includes(id)
}

export function isPostFav(id) {
  return state.postIds.includes(id)
}

export function favSites() {
  const { sites } = useSites()
  return sites.filter((s) => state.siteIds.includes(s.id))
}

export function favPosts() {
  const { posts } = usePosts()
  return posts.filter((p) => state.postIds.includes(p.id))
}

export function useFavorites() {
  return state
}
