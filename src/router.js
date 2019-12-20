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
      name: 'home',
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
      path: '/admin',
      component: () => import(/* webpackChunkName: "admin" */ './views/admin/AdminArea.vue'),
      meta: { restricted: true },
      children: [
        {
          path: 'users',
          name: 'users',
          component: () => import(/* webpackChunkName: "admin" */ './views/admin/Users.vue')
        },
        {
          path: 'wp-users',
          name: 'wp-users',
          component: () => import(/* webpackChunkName: "admin" */ './views/admin/CreateUsersFromWP.vue')
        }
      ]
    },
    {
      path: '/login',
      component: () => import(/* webpackChunkName: "login" */ './views/Login.vue'),
      children: [
        {
          path: '',
          name: 'login',
          component: () => import(/* webpackChunkName: "login" */ './views/components/login/LoginForm.vue')
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import(/* webpackChunkName: "login-password" */ './views/components/login/ForgotPassword.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  /* DEBUG */
  console.log(`%c %c to: `, 'background:#ffbb00;color:#000', 'color:#00aaff', to)
  if (to.name === 'login') {
    if (store.state.user) {
      return next(false)
    }
  } else if (to.matched.some(record => record.meta.restricted)) {
    if (!store.state.user) {
      return next({ name: 'login' })
    } else if (store.state.user.role !== 'admin') {
      return next(false)
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
