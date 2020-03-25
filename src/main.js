import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import * as firebase from './lib/firebase'
import * as VueGoogleMaps from 'vue2-google-maps'

Vue.config.productionTip = false

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyD_qN3NRbaVQoAATO7fcvqGAjEQGsQzkKE'
  }
})

firebase.syncAuth(store)

// @ts-ignore
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
