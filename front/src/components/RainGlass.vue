<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { glassRainEffect } from '../config/effects.config'
import { useEffects } from '../stores/effects'

const props = defineProps({
  config: { type: Object, default: null },
})

const canvasRef = ref(null)
const effects = useEffects()

const cfg = computed(() => props.config || glassRainEffect)
const active = computed(() => effects.enabled)

let fx = null
let runId = 0
let resizeTimer = 0

const isMobile = () => window.matchMedia('(max-width: 768px)').matches

function computeSize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const maxSide = 1920
  let w = Math.round(window.innerWidth * dpr)
  let h = Math.round(window.innerHeight * dpr)
  const k = Math.min(1, maxSide / Math.max(w, h))
  return [Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k))]
}

function buildBackground(width, height) {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const ctx = c.getContext('2d')

  ctx.fillStyle = cfg.value.opts.background || '#04131d'
  ctx.fillRect(0, 0, width, height)

  const topGlow = ctx.createRadialGradient(width * 0.28, height * 0.16, 0, width * 0.28, height * 0.16, width * 0.54)
  topGlow.addColorStop(0, 'rgba(52, 213, 195, 0.3)')
  topGlow.addColorStop(1, 'rgba(52, 213, 195, 0)')
  ctx.fillStyle = topGlow
  ctx.fillRect(0, 0, width, height)

  const bottomGlow = ctx.createRadialGradient(width * 0.76, height * 0.76, 0, width * 0.76, height * 0.76, width * 0.58)
  bottomGlow.addColorStop(0, 'rgba(242, 191, 114, 0.18)')
  bottomGlow.addColorStop(1, 'rgba(242, 191, 114, 0)')
  ctx.fillStyle = bottomGlow
  ctx.fillRect(0, 0, width, height)

  const shade = ctx.createLinearGradient(0, 0, width, height)
  shade.addColorStop(0, 'rgba(3, 17, 27, 0)')
  shade.addColorStop(0.45, 'rgba(8, 35, 53, 0.44)')
  shade.addColorStop(1, 'rgba(4, 19, 29, 0.72)')
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, width, height)

  return c
}

function releaseFx(instance = fx) {
  if (!instance) return
  instance.stop?.()
  instance.destroy?.()
}

async function init() {
  const id = ++runId
  const canvas = canvasRef.value
  if (!canvas) return
  if (!canvas.getContext('webgl2')) {
    canvas.style.display = 'none'
    return
  }

  const mod = await import('raindrop-fx')
  if (id !== runId || !active.value) return
  const RaindropFX = mod.default ?? mod

  const [w, h] = computeSize()
  canvas.width = w
  canvas.height = h

  const { background, backgroundBlurStepsMobile, ...opts } = cfg.value.opts
  const options = {
    canvas,
    width: w,
    height: h,
    ...opts,
    background: buildBackground(w, h),
  }
  if (isMobile()) {
    options.backgroundBlurSteps =
      backgroundBlurStepsMobile ?? Math.max(1, opts.backgroundBlurSteps - 1)
  }

  const nextFx = new RaindropFX(options)
  fx = nextFx
  canvas.style.display = ''
  await nextFx.start()
  if (id !== runId || !active.value) {
    releaseFx(nextFx)
    if (fx === nextFx) fx = null
  }
}

function destroy() {
  runId++
  if (fx) {
    releaseFx()
    fx = null
  }
  if (canvasRef.value) canvasRef.value.style.display = 'none'
}

function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    if (!fx) return
    const canvas = canvasRef.value
    const [w, h] = computeSize()
    if (w === fx.options.width && h === fx.options.height) return
    canvas.width = w
    canvas.height = h
    fx.resize(w, h)
    fx.setBackground?.(buildBackground(w, h)).catch(() => {})
  }, 200)
}

function onVisibility() {
  if (!fx) return
  if (document.hidden) {
    fx.stop()
  } else {
    fx.start().catch(() => {})
  }
}

watch(active, (on) => {
  if (on) {
    init().catch((err) => {
      console.error('[RainGlass] init failed:', err)
      if (canvasRef.value) canvasRef.value.style.display = 'none'
    })
  } else {
    destroy()
  }
})

onMounted(() => {
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibility)
  if (active.value) {
    init().catch((err) => {
      console.error('[RainGlass] init failed:', err)
      if (canvasRef.value) canvasRef.value.style.display = 'none'
    })
  } else {
    destroy()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisibility)
  clearTimeout(resizeTimer)
  destroy()
})
</script>

<template>
  <canvas ref="canvasRef" class="rain-glass" :style="cfg.css" aria-hidden="true" />
</template>

<style scoped>
.rain-glass {
  position: fixed;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
