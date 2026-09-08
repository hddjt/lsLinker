import { reactive } from 'vue'
import { readLS, writeLS, uid } from '../utils/storage'
import { currentUser } from './auth'

const state = reactive({
  rooms: readLS('chatRooms', {}),
  activeRoom: '',
  unread: readLS('chatUnread', {}),
})

function persistRooms() {
  writeLS('chatRooms', state.rooms)
}
function persistUnread() {
  writeLS('chatUnread', state.unread)
}

export function enterRoom(key) {
  const id = String(key).trim()
  if (!id) return
  state.activeRoom = id
  if (!state.rooms[id]) {
    state.rooms[id] = []
    persistRooms()
  }
  const joined = state.rooms[id]
  if (!joined.some((m) => m.system && m.body.includes('加入房间'))) {
    joined.push({
      id: uid('m'),
      system: true,
      body: `${currentUser().nickname} 加入了房间`,
      time: Date.now(),
    })
    persistRooms()
  }
  state.unread[id] = 0
  persistUnread()
  return joined
}

export function leaveRoom() {
  if (state.activeRoom && state.rooms[state.activeRoom]) {
    state.rooms[state.activeRoom].push({
      id: uid('m'),
      system: true,
      body: `${currentUser().nickname} 离开了房间`,
      time: Date.now(),
    })
    persistRooms()
  }
  state.activeRoom = ''
}

export function sendMessage(text) {
  const id = state.activeRoom
  if (!id || !text.trim()) return
  const msg = {
    id: uid('m'),
    author: currentUser().nickname,
    body: text.trim(),
    time: Date.now(),
    self: true,
  }
  state.rooms[id].push(msg)
  persistRooms()
  return msg
}

export function incomingMessage(roomId, text, author = '房间助手') {
  if (!state.rooms[roomId]) state.rooms[roomId] = []
  state.rooms[roomId].push({
    id: uid('m'),
    author,
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

export function totalUnread() {
  return Object.values(state.unread).reduce((a, b) => a + (b || 0), 0)
}

export function messagesOf(roomId) {
  return state.rooms[roomId] || []
}

export function useChat() {
  return state
}
