<script setup>
defineProps({
  status: {
    type: Number,
    required: true,
  },
  error: {
    type: Error,
    required: true,
  },
});
</script>

<template>
  <h1>{{ status }}</h1>
  <pre>{{ error.message }}</pre>
  <pre v-if="error.frame">{{ error.frame }}</pre>
  <pre v-if="error.stack">{{ error.stack }}</pre>
</template>
