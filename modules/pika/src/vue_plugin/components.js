import { usePika } from './pika'
import { defineComponent, h, onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'

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

export const Root = defineComponent({
  name: 'Root',
  setup(props) {
    const pika = usePika()
    pika.data = props.data
    return () => h(RouterView)
  },
})
