import { createApp, type App as AppType } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { syncAuth } from './lib/firebase'
import VueLazyload from 'vue-lazyload'

const app = createApp(App as unknown as AppType)

// Configure Lazy Loading
app.use(VueLazyload, {
  preLoad: 1.3,
  error: '/img/error.png',
  loading: '/img/loading.gif',
  attempt: 1
})

app.use(store)
app.use(router)

syncAuth(store)

app.mount('#app')
