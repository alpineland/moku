<script setup>
import { useHead } from '@vueuse/head'
import { RouterLink } from 'vue-router'

useHead({
  title: 'user index',
})

defineProps({
  user: String,
})
</script>

<template>
  <h1>This is user {{ user }}</h1>
  <RouterLink to="/vitejs/vite">vitejs/vite</RouterLink>
</template>
