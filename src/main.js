import Vue from 'vue'
// @ts-ignore
import App from './App.vue'
import router from './router'
import store from './store'
import * as firebase from './lib/firebase'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

firebase.syncAuth(store)

// @ts-ignore
new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
