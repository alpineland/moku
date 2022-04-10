<script setup>
import TheWelcome from '~/components/TheWelcome.vue';
import { useHead } from '@vueuse/head';
import { RouterLink } from 'vue-router';

useHead({
  title: 'Home',
});
</script>

<template>
  <main>
    <TheWelcome />
    <RouterLink to="/about">About</RouterLink>
  </main>
</template>
