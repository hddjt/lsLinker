import { ref, computed, watch, onScopeDispose } from 'vue'

export function useSiteFilter(sites, categories) {
  const kw = ref('')
  const activeCat = ref('all')
  const debouncedKw = ref('')

  let timer = null
  watch(
    kw,
    (v) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        debouncedKw.value = v
      }, 300)
    },
    { immediate: true },
  )
  onScopeDispose(() => clearTimeout(timer))

  const q = computed(() => debouncedKw.value.trim().toLowerCase())

  const catNames = computed(() => {
    const m = new Map()
    for (const c of categories) m.set(c.id, c.name.toLowerCase())
    return m
  })

  const filtered = computed(() => {
    const query = q.value
    const active = activeCat.value
    const names = catNames.value
    return sites.filter((s) => {
      if (active !== 'all' && s.category !== active) return false
      if (!query) return true
      const fields = [s.name, s.desc, s.url, names.get(s.category)]
      return fields.some((f) => (f || '').toLowerCase().includes(query))
    })
  })

  const grouped = computed(() => {
    if (activeCat.value !== 'all') {
      const cat = categories.find((c) => c.id === activeCat.value)
      return [{ cat, list: filtered.value }]
    }
    return categories
      .map((c) => ({ cat: c, list: filtered.value.filter((s) => s.category === c.id) }))
      .filter((g) => g.list.length)
  })

  const catCounts = computed(() => {
    const m = {}
    for (const s of sites) m[s.category] = (m[s.category] || 0) + 1
    return m
  })

  const isEmpty = computed(() => sites.length === 0)
  const noMatch = computed(() => !isEmpty.value && filtered.value.length === 0)

  return { kw, activeCat, filtered, grouped, catCounts, isEmpty, noMatch }
}
