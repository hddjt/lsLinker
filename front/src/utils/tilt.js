export const tilt = {
  mounted(el) {
    let raf = 0

    const onMove = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const rect = el.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return
        const px = (e.clientX - rect.left) / rect.width
        const py = (e.clientY - rect.top) / rect.height
        const mx = (px - 0.5) * 2
        const my = (py - 0.5) * 2
        const strength = Number(el.dataset.tilt || 7)
        const maxShadow = Number(el.dataset.tiltShadow || 22)
        const rx = -my * strength
        const ry = mx * strength
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top
        const dist = Math.hypot(cx - rect.width / 2, cy - rect.height / 2)
        const maxDist = Math.hypot(rect.width, rect.height) / 2
        const pd = Math.min(1, dist / maxDist)
        el.style.setProperty('--mx', `${px * 100}%`)
        el.style.setProperty('--my', `${py * 100}%`)
        el.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
        el.style.setProperty('--ry', `${ry.toFixed(2)}deg`)
        el.style.setProperty('--pd', pd.toFixed(2))
        el.style.setProperty('--ty', `${(1 - pd) * -3}px`)
        el.style.setProperty('--pcx', `${(-mx * maxShadow).toFixed(1)}px`)
        el.style.setProperty('--pcy', `${(-my * maxShadow).toFixed(1)}px`)
      })
    }

    const onLeave = () => {
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
      el.style.setProperty('--pd', '0')
      el.style.setProperty('--ty', '0px')
      el.style.setProperty('--pcx', '0px')
      el.style.setProperty('--pcy', '0px')
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    el._tiltCleanup = () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  },
  unmounted(el) {
    el._tiltCleanup?.()
  },
}
