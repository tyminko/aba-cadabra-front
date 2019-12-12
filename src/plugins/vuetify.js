import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#0031ff',
        secondary: '#bdcbd2',
        accent: '#0093ff',
        error: '#f54151'
      }
    }
  }
})
