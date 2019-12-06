import Vue from 'vue'
import Router from 'vue-router'
import Works from './views/Works.vue'
import Work from './views/Work.vue'
import store from './store'
import localData from './lib/local-storage'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'works',
      component: Works
    },
    {
      path: '/work/:id',
      name: 'work',
      component: Work
    },
    {
      path: '/about',
      name: 'about',
      component: () =>
        import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/login',
      component: () => import(/* webpackChunkName: "login" */ './views/Login.vue'),
      children: [
        {
          path: '',
          name: 'login',
          component: () => import(/* webpackChunkName: "login" */ './components/login/LoginForm.vue')
        },
        {
          path: '',
          name: 'forgot-password',
          component: () => import(/* webpackChunkName: "login-password" */ './components/login/ForgotPassword.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.name === 'login') {
    if (store.state.user) {
      next(false)
      return
    }
  }
  next()
})
router.afterEach(to => {
  if (to.name !== 'login') {
    localData.set('last-visited-route', { name: to.name, params: to.params })
  }
})

export default router
