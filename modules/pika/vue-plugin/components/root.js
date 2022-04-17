import { defineComponent, h, Suspense } from 'vue';
import { RouterView } from 'vue-router';

export const Root = defineComponent({
  name: 'Root',
  setup() {
    return () => h(Suspense, h(RouterView));
  },
});
