<script setup>
import { useHead } from '@vueuse/head'
import { RouterLink } from 'vue-router'

useHead({
  title: 'About',
})
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <RouterLink to="/ydcjeff">ydcjeff</RouterLink>
  </div>
</template>

<style scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
