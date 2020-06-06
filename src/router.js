import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home'
import store from './store'
import localData from './lib/local-storage'
import { updateBookmarksHistory } from './lib/bookmarks'

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
      meta: { restricted: true },
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
      path: '/partners',
      name: 'partners',
      component: () => import(/* webpackChunkName: "institutions" */ './views/Institutions')
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
  // A "guard" to keep a "shadow" history stack. That
  // stack can be used to implement a bookmark functionality,
  // which allows loading posts into modal and navigate through the history.
  // based on: https://codepen.io/ksurakka/pen/RwwKyPy
  // We need to defer the execution to get the state key,
  // it's not yet there (or it can be, but it's a wrong one)
  setTimeout(() => {
    const key = history.state && history.state.key
    if (key) {
      updateBookmarksHistory(key, to.fullPath, (from || {}).fullPath)
    }
  })
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
