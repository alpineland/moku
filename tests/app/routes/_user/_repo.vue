<script setup>
import { useHead } from '@vueuse/head';
import { useData } from 'pika/vue_plugin';
import { useRoute, RouterLink } from 'vue-router';

const data = useData();
const route = useRoute();

useHead({
  title: route.params.repo + ' $repo',
});

defineProps({
  repo: String,
  user: String,
});
</script>

<template>
  <h1>This is repo {{ repo }} from {{ user }}</h1>
  <div>
    {{ data }}
  </div>
  <RouterLink to="/">Home</RouterLink>
</template>
