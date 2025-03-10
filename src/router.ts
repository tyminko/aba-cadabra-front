import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import store from './store'
import localData from './lib/local-storage'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/internal',
    name: 'internal',
    meta: { authorisation: true },
    component: () => import('./views/PostFeedInternal.vue')
  },
  {
    path: '/drafts',
    name: 'drafts',
    meta: { authorisation: true },
    component: () => import('./views/PostFeedDrafts.vue')
  },
  {
    path: '/trash',
    name: 'trash',
    meta: { authorisation: true },
    component: () => import('./views/PostFeedTrash.vue')
  },
  {
    path: '/in/:filter',
    name: 'home-filtered',
    meta: { authorisation: true },
    component: () => import('./views/PostFeedInternal.vue')
  },
  {
    path: '/programme/:id/:postId?',
    name: 'programme',
    component: () => import('./views/ProgrammeFeed.vue')
  },
  {
    path: '/page/:id',
    name: 'page',
    component: () => import('./views/PageView.vue')
  },
  {
    path: '/event/:id/:token?',
    name: 'event',
    components: {
      popup: () => import('./views/EventPopover.vue')
    }
  },
  {
    path: '/blog/:authorId/:postId?',
    name: 'author-blog',
    components: {
      popup: () => import('./views/BlogPopover.vue')
    }
  },
  {
    path: '/profile/:id',
    name: 'profile',
    components: {
      popup: () => import('./views/ProfilePopover.vue')
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
    component: () => import('./views/components/page-templates/Partners.vue')
  },
  {
    path: '/admin',
    component: () => import('./views/Admin.vue'),
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

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Authentication guard
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

// Save last visited route
router.afterEach(to => {
  if (to.name !== 'login') {
    localData.set('last-visited-route', { name: to.name, params: to.params })
  }
})

export default router
