<script setup>
import { ref, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth, login, logout } from '../stores/auth'
import { totalUnread as transferUnread } from '../stores/transfer'
import { initials } from '../utils/storage'

const auth = useAuth()
const showLogin = ref(false)
const form = reactive({ nickname: '' })

const navs = [
  { to: '/', label: '导航' },
  { to: '/forum', label: '论坛' },
  { to: '/favorites', label: '收藏' },
  { to: '/chat', label: '聊天' },
  { to: '/transfer', label: '中转', badge: true },
  { to: '/about', label: '关于' },
]

function submitLogin() {
  if (!form.nickname.trim()) return
  login(form.nickname)
  form.nickname = ''
  showLogin.value = false
}
</script>

<template>
  <header class="sticky top-0 z-40 px-4">
    <div
      class="mx-auto mt-4 flex max-w-[1600px] items-center gap-3 rounded-3xl border border-[--line-strong] bg-[--header-bg] px-5 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl"
    >
      <RouterLink to="/" class="flex items-center gap-2.5" title="lsLinker">
        <span
          class="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[--primary] to-[--accent] text-sm font-bold text-white shadow-lg shadow-teal-500/30"
        >
          L
        </span>
        <span class="text-[15px] font-semibold tracking-wide text-[--text-h]">
          lsLinker
        </span>
      </RouterLink>

      <nav class="ml-2 flex flex-1 items-center gap-1 overflow-x-auto">
        <RouterLink
          v-for="n in navs"
          :key="n.to"
          :to="n.to"
          class="group relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] text-[--text-mute] transition-colors hover:text-[--text-h]"
          active-class="!text-[--text-h]"
        >
          <span
            class="absolute inset-0 rounded-lg opacity-0 transition-opacity"
            :class="$route.path === n.to ? '!opacity-100 bg-gradient-to-br from-[--primary] to-[--accent] shadow-lg shadow-teal-500/25' : ''"
          />
          <span class="relative font-medium">{{ n.label }}</span>
          <span
            v-if="n.badge && transferUnread() > 0"
            class="badge relative -ml-0.5"
          >
            {{ transferUnread() }}
          </span>
        </RouterLink>
      </nav>

      <div class="flex items-center gap-2">
        <RouterLink
          to="/settings"
          class="btn btn-ghost btn-icon btn-sm"
          title="个人设置"
          active-class="!text-[--primary]"
        >
          ⚙️
        </RouterLink>
        <template v-if="auth.token">
          <div class="flex items-center gap-2">
            <span
              class="grid h-7 w-7 place-items-center rounded-full bg-[--field-bg] text-xs font-bold text-[--text-h] ring-1 ring-white/10"
            >
              {{ initials(auth.nickname) }}
            </span>
            <span class="max-w-[120px] truncate text-[13px] font-medium text-[--text-h]">
              {{ auth.nickname }}
            </span>
          </div>
          <button class="btn btn-ghost btn-sm" @click="logout">退出</button>
        </template>
        <button v-else class="btn btn-primary btn-sm" @click="showLogin = true">
          登录
        </button>
      </div>
    </div>
  </header>

  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showLogin"
        class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
        @click.self="showLogin = false"
      >
        <form
          class="glass w-full max-w-sm p-6"
          @submit.prevent="submitLogin"
        >
          <h3 class="mb-1 text-lg">账号登录（占位）</h3>
          <p class="muted mb-4 text-[12px]">
            当前使用 localStorage 占位，真后端接入后将切换为 JWT 鉴权。
          </p>
          <input
            v-model="form.nickname"
            class="input mb-4"
            placeholder="输入昵称（登录占位）"
            maxlength="16"
            autofocus
          />
          <div class="flex justify-end gap-2">
            <button type="button" class="btn btn-ghost" @click="showLogin = false">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="!form.nickname.trim()">
              进入
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>
