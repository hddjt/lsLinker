const PREFIX = 'lsLinker:'

export function readLS(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeLS(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`
}

export function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  const s = Math.floor(diff / 1000)
  if (s < 60) return '刚刚'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} 天前`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo} 个月前`
  return `${Math.floor(mo / 12)} 年前`
}

export function fmtTime(ts) {
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(
    d.getHours(),
  )}:${p(d.getMinutes())}`
}

export function siteIcon(url) {
  if (!url) return ''
  try {
    const u = new URL(url)
    return `https://${u.hostname}/favicon.ico`
  } catch {
    return ''
  }
}

export function normalizeUrl(url) {
  if (!url) return ''
  const t = url.trim()
  if (!t) return ''
  return /^https?:\/\//i.test(t) ? t : `https://${t}`
}

export function fmtSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function initials(name = '') {
  return (name.trim()[0] || '?').toUpperCase()
}
