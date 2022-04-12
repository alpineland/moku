import { defineComponent, h } from 'vue';
import { RouterView } from 'vue-router';

export const Root = defineComponent({
  name: 'Root',
  setup() {
    return () => h(RouterView);
  },
});
