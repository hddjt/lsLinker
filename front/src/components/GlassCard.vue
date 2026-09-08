<script setup>
import { tilt } from '../utils/tilt'

defineProps({
  tiltStrength: { type: Number, default: 6 },
  shadow: { type: Number, default: 20 },
})
</script>

<template>
  <div class="glass tilt" v-tilt :data-tilt="tiltStrength" :data-tilt-shadow="shadow">
    <slot />
  </div>
</template>
