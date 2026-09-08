<script setup>
import Header from './layout/Header.vue'
import Footer from './layout/Footer.vue'
import AppSidebar from './layout/AppSidebar.vue'
import RainGlass from './components/RainGlass.vue'
</script>

<template>
  <div class="app-bg" />
  <RainGlass />
  <div class="app-content flex min-h-screen flex-col">
    <Header />
    <main class="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-6 px-4 pt-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-8">
      <AppSidebar />
      <section class="min-w-0">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </section>
    </main>
    <Footer />
  </div>
</template>
