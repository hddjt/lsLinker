import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ForumView from '../views/ForumView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import AboutView from '../views/AboutView.vue'
import ChatView from '../views/ChatView.vue'
import TransferView from '../views/TransferView.vue'

const routes = [
  { path: '/', name: 'nav', component: Home, meta: { title: '导航' } },
  { path: '/forum', name: 'forum', component: ForumView, meta: { title: '论坛' } },
  { path: '/favorites', name: 'favorites', component: FavoritesView, meta: { title: '收藏' } },
  { path: '/about', name: 'about', component: AboutView, meta: { title: '关于' } },
  { path: '/chat', name: 'chat', component: ChatView, meta: { title: '聊天' } },
  { path: '/transfer', name: 'transfer', component: TransferView, meta: { title: '中转' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = `lsLinker · ${to.meta.title || ''}`
})

export default router
