<template>
  <div class="institutions institutions-editor">
    <institutions>
      <template v-slot:default="{institutions, setOrder}">
        <draggable-content
          v-model="institutions"
          @end="setOrder(institutions)"
          draggable=".partner-box"
          container-class="grid">
          <div v-for="institute in institutions" :key="institute.id" class="partner-box">
            <h1>{{institute.title}}</h1>
          </div>
        </draggable-content>
      </template>
    </institutions>
  </div>
</template>

<script>
import Institutions from '../Institutions'
import DraggableContent from '../components/UI/DraggableContent'
export default {
  name: 'InstitutionsEditor',
  components: { DraggableContent, Institutions },
  props: {},

  data: () => ({}),

  computed: {},

  methods: {
  }
}
</script>

<style lang="scss">
  .institutions-editor {
  }
</style>
