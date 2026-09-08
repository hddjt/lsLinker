<template>
  <div class="mx-auto max-w-2xl">
    <div class="glass tilt overflow-hidden p-8 text-center" v-tilt :data-tilt="4" :data-tilt-shadow="16">
      <div class="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#6d8dff] to-[#b06bff] text-2xl font-bold text-white shadow-xl shadow-indigo-500/40">
        L
      </div>
      <h1 class="text-2xl">lsLinker</h1>
      <p class="muted mt-1 text-[13px]">v0.1.0 · 网址导航与论坛结合</p>
      <div class="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div v-for="f in features" :key="f.title" class="glass !rounded-xl p-3 text-center">
          <div class="text-xl">{{ f.icon }}</div>
          <div class="mt-1 text-[13px] font-semibold text-[--text-h]">{{ f.title }}</div>
          <div class="muted mt-0.5 text-[11px]">{{ f.desc }}</div>
        </div>
      </div>
    </div>

    <div class="glass mt-6 p-6">
      <h2 class="mb-3 text-[15px] font-semibold">功能简介</h2>
      <ul class="flex flex-col gap-2 text-[13px] text-[--text]">
        <li v-for="(t, i) in intro" :key="i" class="flex gap-2">
          <span class="text-[#8fa6ff]">•</span>
          <span>{{ t }}</span>
        </li>
      </ul>
    </div>

    <div class="glass mt-6 p-6">
      <h2 class="mb-3 text-[15px] font-semibold">技术栈</h2>
      <div class="flex flex-wrap gap-2">
        <span v-for="t in stack" :key="t" class="chip !cursor-default">{{ t }}</span>
      </div>
    </div>

    <div class="glass mt-6 p-6">
      <h2 class="mb-3 text-[15px] font-semibold">开发状态</h2>
      <div class="flex flex-col gap-3">
        <div v-for="s in stages" :key="s.name" class="flex items-center gap-3 text-[13px]">
          <span
            class="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold"
            :class="s.done ? 'bg-[#37d39a]/20 text-[#37d39a]' : 'bg-white/10 text-[--text-mute]'"
          >
            {{ s.done ? '✓' : '•' }}
          </span>
          <span class="flex-1" :class="s.done ? 'text-[--text]' : 'text-[--text-mute]'">
            {{ s.name }}
          </span>
        </div>
      </div>
    </div>

    <div class="glass mt-6 p-6 text-center">
      <p class="muted text-[12px]">账号体系当前为 localStorage 占位，真后端（香港服务器）接入后将切换 JWT 鉴权与 WebSocket 实时通信。</p>
      <div class="mt-3 flex justify-center gap-3">
        <span class="chip !cursor-default">联系作者 ✉️</span>
        <span class="chip !cursor-default">仓库地址 🔗</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const features = [
  { icon: '🧭', title: '网址导航', desc: '分类管理' },
  { icon: '💬', title: '论坛', desc: '发帖回帖' },
  { icon: '⭐', title: '收藏', desc: '站点+帖子' },
  { icon: '🟢', title: '聊天', desc: '房间实时' },
  { icon: '📦', title: '文件中转', desc: '密钥配对' },
  { icon: '🌐', title: '部署', desc: '香港服务器' },
]

const intro = [
  '面向个人 / 小圈子的「网址导航 + 论坛」二合一 Web 应用',
  '导航页支持搜索、分类、增删改、收藏与点击统计',
  '论坛支持发帖、回帖、点赞与我的内容筛选',
  '聊天与文件中转采用房间模式，通过密钥配对进入',
  '视觉上贯彻光影、玻璃拟态与指针跟随阴影三大硬性要求',
]

const stack = ['Vue 3', 'Vite', 'Tailwind CSS v4', 'vue-router', 'localStorage 占位', '（后端待接入）']

const stages = [
  { name: 'P0 单文件 Demo v1 · 导航/论坛/收藏/关于', done: true },
  { name: 'P1 Demo v2 · 补全聊天 + 文件中转', done: true },
  { name: 'P2 工程化重构 · Vue3 + Tailwind（当前）', done: true },
  { name: 'P3 接入真实后端 · JWT / WS / 文件上传', done: false },
  { name: 'P4 部署上线 · Nginx / CF，移动端适配', done: false },
]
</script>
