import { defineComponent, ref, onMounted } from 'vue'

export const ClientOnly = defineComponent({
  name: 'ClientOnly',
  setup(_, { slots }) {
    const show = ref(false)
    onMounted(() => {
      show.value = true
    })
    return () => show.value && slots.default?.()
  },
})
