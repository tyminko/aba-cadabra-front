import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import * as firebase from './lib/firebase'
import * as VueGoogleMaps from 'vue2-google-maps'
import VueLazyload from 'vue-lazyload'

Vue.config.productionTip = false

Vue.use(VueLazyload, {
  observer: true
})
Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.VUE_APP_MAP_KEY
  }
})

firebase.syncAuth(store)

// @ts-ignore
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
