import { reactive } from 'vue'
import { readLS, writeLS, uid } from '../utils/storage'

const state = reactive({
  nickname: readLS('auth', null)?.nickname || '',
  token: readLS('auth', null)?.token || '',
})

export const isLoggedIn = () => !!state.token

export function login(nickname) {
  const name = nickname.trim() || '匿名用户'
  state.nickname = name
  state.token = uid('tk')
  writeLS('auth', { nickname: name, token: state.token })
}

export function logout() {
  state.nickname = ''
  state.token = ''
  localStorage.removeItem('lsLinker:auth')
}

export function currentUser() {
  return {
    nickname: state.nickname || '游客',
    token: state.token,
  }
}

export function useAuth() {
  return state
}
