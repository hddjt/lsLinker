<script setup>
import Header from './layout/Header.vue'
import Footer from './layout/Footer.vue'
</script>

<template>
  <div class="app-bg" />
  <div class="flex min-h-screen flex-col">
    <Header />
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 pt-6">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <Footer />
  </div>
</template>
