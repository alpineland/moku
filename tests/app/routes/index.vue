<script setup>
import TheWelcome from '~/components/TheWelcome.vue';
import { useHead } from '@vueuse/head';
import { RouterLink, RouterView } from 'vue-router';
import { useData } from 'pika/vue-plugin';

useHead({
  title: 'Home',
});

const { data, fetching } = await useData();
</script>

<template>
  <main>
    <TheWelcome />
    <RouterLink to="/user/vite">About</RouterLink>
    <RouterLink to="/name/vite">About</RouterLink>
    <div v-if="fetching">loading...</div>
    <pre v-else>
      status - {{ fetching }}
      data - {{ data }}
    </pre>
    <RouterView />
  </main>
</template>
