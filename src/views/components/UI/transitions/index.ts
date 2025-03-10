import { defineComponent } from 'vue'

export const FadeTransition = defineComponent({
  name: 'FadeTransition',
  template: `
    <transition name="fade" mode="out-in" appear>
      <slot></slot>
    </transition>
  `
})

export const SlideTransition = defineComponent({
  name: 'SlideTransition',
  template: `
    <transition name="slide" mode="out-in" appear>
      <slot></slot>
    </transition>
  `
})

export default {
  FadeTransition,
  SlideTransition
}
