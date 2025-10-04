import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home'
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
      component: Home
    },
    {
      path: '/internal',
      name: 'internal',
      meta: { authorisation: true },
      component: () => import(/* webpackChunkName: "programme" */ './views/PostFeedInternal')
    },
    {
      path: '/drafts',
      name: 'drafts',
      meta: { authorisation: true },
      component: () => import(/* webpackChunkName: "programme" */ './views/PostFeedDrafts')
    },
    {
      path: '/trash',
      name: 'trash',
      meta: { authorisation: true },
      component: () => import(/* webpackChunkName: "programme" */ './views/PostFeedTrash')
    },
    {
      path: '/in/:filter',
      name: 'home-filtered',
      meta: { authorisation: true },
      component: Home
    },
    {
      path: '/programme/:id/:postId?',
      name: 'programme',
      component: () => import(/* webpackChunkName: "programme" */ './views/ProgrammeFeed')
    },
    {
      path: '/page/:id',
      name: 'page',
      component: () => import(/* webpackChunkName: "programme" */ './views/PageView')
    },
    {
      path: '/event/:id/:token?',
      name: 'event',
      components: {
        popup: () => import(/* webpackChunkName: "blog" */ './views/EventPopover')
      }
    },
    {
      path: '/blog/:authorId/:postId?',
      name: 'author-blog',
      components: {
        popup: () => import(/* webpackChunkName: "blog" */ './views/BlogPopover')
      }
    },
    {
      path: '/profile/:id',
      name: 'profile',
      components: {
        popup: () => import(/* webpackChunkName: "blog" */ './views/ProfilePopover')
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/subscribe',
      name: 'subscribe',
      component: () => import(/* webpackChunkName: "about" */ './views/components/MailchimpForm.vue')
    },
    {
      path: '/partners',
      name: 'partners',
      component: () => import(/* webpackChunkName: "institutions" */ './views/components/page-templates/Partners')
    },
    {
      path: '/resident-blogs',
      name: 'resident-blogs',
      component: () => import(/* webpackChunkName: "blogs" */ './views/components/page-templates/ResidentBlogs')
    },
    {
      path: '/logo-demo',
      name: 'logo-demo',
      component: () => import(/* webpackChunkName: "logo-demo" */ './views/LogoDemo.vue')
    },
    {
      path: '/admin',
      component: () => import(/* webpackChunkName: "admin" */ './views/admin/AdminArea.vue'),
      meta: { restricted: true },
      children: [
        {
          name: 'users',
          path: 'users',
          component: () => import(/* webpackChunkName: "admin" */ './views/admin/Users.vue')
        },
        {
          name: 'wp-users',
          path: 'wp-users',
          component: () => import(/* webpackChunkName: "admin" */ './views/admin/CreateUsersFromWP.vue')
        },
        {
          path: 'wp-posts',
          name: 'wp-posts',
          component: () => import(/* webpackChunkName: "admin" */ './views/admin/TransferWpPosts.vue')
        },
        {
          path: 'wp-attachments',
          name: 'wp-attachments',
          component: () => import(/* webpackChunkName: "admin" */ './views/admin/TransferWpAttachments.vue')
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
  if (to.name === 'login') {
    if (store.state.user) {
      return next(false)
    }
  } else if (to.matched.some(record => record.meta.restricted)) {
    if (store.state.user === null) {
      return next({ name: 'login' })
    } else if (store.state.user.role !== 'admin') {
      return next(false)
    }
  } else if (to.matched.some(record => record.meta.authorisation)) {
    if (store.state.user === null) {
      return next({ name: 'login' })
    }
  }
  next()
})

router.beforeEach((to, from, next) => {
  next()
})
router.afterEach(to => {
  if (to.name !== 'login') {
    localData.set('last-visited-route', { name: to.name, params: to.params })
  }
})

export default router
