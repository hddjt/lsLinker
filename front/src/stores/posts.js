import { reactive } from 'vue'
import { readLS, writeLS, uid } from '../utils/storage'
import { currentUser } from './auth'

const DEFAULT_POSTS = [
  {
    id: 'p_1',
    title: '欢迎来到 lsLinker 论坛',
    body: '这里汇聚了网址导航与社区讨论。\n\n你可以：\n1. 在导航页收藏常用站点\n2. 在论坛发帖交流\n3. 在中转页用密钥配对房间互传文本与小文件\n\n祝使用愉快！',
    author: '系统',
    time: Date.now() - 8.64e7 * 6,
    likes: 42,
    likedBy: [],
  },
  {
    id: 'p_2',
    title: '收集：大家常用哪些开发工具？',
    body: '最近在整理自己的工具箱，想看看大家日常开发都离不开哪些工具或网站。\n\n我先来：VSCode、GitHub Copilot、Docker Desktop、Figma。',
    author: '前端小白',
    time: Date.now() - 8.64e7 * 2,
    likes: 12,
    likedBy: [],
  },
  {
    id: 'p_3',
    title: '玻璃拟态设计的一点心得',
    body: '最近在做导航站重构，想分享几个玻璃拟态的小技巧：\n\n- 背景一定要有彩色光晕，否则磨砂效果不明显\n- backdrop-blur 值建议 12-24px\n- 描边用 1px 半透明白，内高光用 inset 阴影\n- 指针跟随阴影让卡片更有质感',
    author: '设计控',
    time: Date.now() - 8.64e7,
    likes: 7,
    likedBy: [],
  },
]

const DEFAULT_REPLIES = [
  { id: 'r_1', postId: 'p_1', author: '前端小白', body: '支持！期待后续接入真正的后端。', time: Date.now() - 8.64e7 * 5 },
  { id: 'r_2', postId: 'p_1', author: '系统', body: '后端（香港服务器）正在开发中，后续会切到 JWT 鉴权。', time: Date.now() - 8.64e7 * 5 + 3600e3 },
  { id: 'r_3', postId: 'p_2', author: '设计控', body: '我还会用 Raycast、Warp、Obsidian。', time: Date.now() - 8.64e7 * 1.5 },
]

const state = reactive({
  posts: readLS('posts', DEFAULT_POSTS),
  replies: readLS('replies', DEFAULT_REPLIES),
})

function persist() {
  writeLS('posts', state.posts)
  writeLS('replies', state.replies)
}

export function addPost({ title, body }) {
  const p = {
    id: uid('p'),
    title: title.trim(),
    body: body.trim(),
    author: currentUser().nickname,
    time: Date.now(),
    likes: 0,
    likedBy: [],
  }
  state.posts.unshift(p)
  persist()
  return p
}

export function deletePost(id) {
  state.posts = state.posts.filter((p) => p.id !== id)
  state.replies = state.replies.filter((r) => r.postId !== id)
  persist()
}

export function likePost(id) {
  const me = currentUser().nickname
  const p = state.posts.find((x) => x.id === id)
  if (!p) return
  if (p.likedBy.includes(me)) {
    p.likedBy = p.likedBy.filter((n) => n !== me)
    p.likes = Math.max(0, p.likes - 1)
  } else {
    p.likedBy.push(me)
    p.likes += 1
  }
  persist()
}

export function isLiked(id) {
  const p = state.posts.find((x) => x.id === id)
  return p ? p.likedBy.includes(currentUser().nickname) : false
}

export function addReply(postId, body) {
  const r = {
    id: uid('r'),
    postId,
    author: currentUser().nickname,
    body: body.trim(),
    time: Date.now(),
  }
  state.replies.push(r)
  persist()
  return r
}

export function repliesOf(postId) {
  return state.replies.filter((r) => r.postId === postId)
}

export function myPosts() {
  return state.posts.filter((p) => p.author === currentUser().nickname)
}

export function myReplies() {
  const postIds = state.replies
    .filter((r) => r.author === currentUser().nickname)
    .map((r) => r.postId)
  return state.posts.filter((p) => postIds.includes(p.id))
}

export function usePosts() {
  return state
}
