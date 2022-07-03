import vue from '@vitejs/plugin-vue';
import inspect from 'vite-plugin-inspect';
import { moku } from 'moku/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue(), moku(), inspect()],
  resolve: {
    alias: {
      '~': new URL('./app', import.meta.url).pathname,
    },
  },
  build: {
    minify: false,
  },
});
