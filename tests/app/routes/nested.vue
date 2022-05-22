<script>
/* #__PURE__ */ export function get() {}
</script>

<script setup>
import { useData } from 'pika/vue-plugin';

const { data, fetching } = await useData();
</script>

<template>
  <div v-if="fetching">loading oak...</div>
  <pre v-else>
    oak - {{ data }}
    {{ $route.params.profile }}
  </pre>
</template>

<style scoped>
div {
  color: red;
}

pre {
  font-family: JetBrains Mono;
}
</style>
