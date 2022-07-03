<script setup>
import { useHead } from '@vueuse/head';
import { useData } from '@pika/vue';

useHead({
  title: 'About',
});

const { data, fetching } = await useData();
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <RouterLink to="/user/vite">Home</RouterLink>
    {{ fetching }} - {{ data }}
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
