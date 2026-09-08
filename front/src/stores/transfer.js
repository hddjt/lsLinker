import { reactive } from 'vue'
import { readLS, writeLS, uid } from '../utils/storage'
import { currentUser } from './auth'

const state = reactive({
  rooms: readLS('transferRooms', {}),
  activeRoom: '',
  unread: readLS('transferUnread', {}),
})

function persistRooms() {
  writeLS('transferRooms', state.rooms)
}
function persistUnread() {
  writeLS('transferUnread', state.unread)
}

export function isValidKey(key) {
  return /^\d{6,}$/.test(String(key).trim())
}

export function joinRoom(key) {
  const k = String(key).trim()
  if (!isValidKey(k)) return null
  state.activeRoom = k
  if (!state.rooms[k]) {
    state.rooms[k] = { texts: [], files: [] }
    persistRooms()
  }
  state.unread[k] = 0
  persistUnread()
  return state.rooms[k]
}

export function leaveRoom() {
  state.activeRoom = ''
}

export function pushText(text) {
  const k = state.activeRoom
  if (!k || !text.trim()) return
  state.rooms[k].texts.push({
    id: uid('t'),
    author: currentUser().nickname,
    body: text.trim(),
    time: Date.now(),
    self: true,
  })
  persistRooms()
}

export function pushFile({ name, size, progress = 100 }) {
  const k = state.activeRoom
  if (!k) return
  state.rooms[k].files.push({
    id: uid('f'),
    author: currentUser().nickname,
    name,
    size,
    progress,
    time: Date.now(),
    self: true,
  })
  persistRooms()
}

export function peerText(roomId, text) {
  if (!state.rooms[roomId]) state.rooms[roomId] = { texts: [], files: [] }
  state.rooms[roomId].texts.push({
    id: uid('t'),
    author: '对端',
    body: text,
    time: Date.now(),
    self: false,
  })
  persistRooms()
  if (roomId !== state.activeRoom) {
    state.unread[roomId] = (state.unread[roomId] || 0) + 1
    persistUnread()
  }
}

export function peerFile(roomId, name, size) {
  if (!state.rooms[roomId]) state.rooms[roomId] = { texts: [], files: [] }
  state.rooms[roomId].files.push({
    id: uid('f'),
    author: '对端',
    name,
    size,
    progress: 100,
    time: Date.now(),
    self: false,
  })
  persistRooms()
  if (roomId !== state.activeRoom) {
    state.unread[roomId] = (state.unread[roomId] || 0) + 1
    persistUnread()
  }
}

export function totalUnread() {
  return Object.values(state.unread).reduce((a, b) => a + (b || 0), 0)
}

export function useTransfer() {
  return state
}
