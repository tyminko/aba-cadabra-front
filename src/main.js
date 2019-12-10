import Vue from 'vue'
// @ts-ignore
import App from './App.vue'
import router from './router'
import store from './store'
import * as firebase from './lib/firebase'

Vue.config.productionTip = false

firebase.syncAuth(store)

// @ts-ignore
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
