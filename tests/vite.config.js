import vue from '@vitejs/plugin-vue';
import inspect from 'vite-plugin-inspect';
import { pika } from 'pika/vite_plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue(), pika(), inspect()],
  resolve: {
    alias: {
      '~': new URL('./app', import.meta.url).pathname,
    },
  },
  build: {
    minify: false,
  },
});
