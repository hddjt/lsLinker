import { reactive } from 'vue'
import { readLS, writeLS } from '../utils/storage'
import { glassRainEffect } from '../config/effects.config'

const state = reactive({
  enabled: readLS('effects.enabled', glassRainEffect.enabled !== false),
})

export function setEffectEnabled(enabled) {
  state.enabled = !!enabled
  writeLS('effects.enabled', state.enabled)
}

export function toggleEffect() {
  setEffectEnabled(!state.enabled)
}

export function useEffects() {
  return state
}
