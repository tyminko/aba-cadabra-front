import Vue from 'vue'
import Vuex from 'vuex'
import { auth, db } from './lib/firebase'
import router from './router'

Vue.use(Vuex)

const unsubscribeMenu = { public: null, internal: null, draftProgrammes: null, draftPages: null }
const unsubscribeDrafts = () => {
  ['draftProgrammes', 'draftPages'].forEach(draft => {
    if (typeof unsubscribeMenu[draft] === 'function') unsubscribeMenu[draft]()
    unsubscribeMenu[draft] = null
  })
}
const unsubscribeRestricted = () => {
  unsubscribeDrafts()
  if (typeof unsubscribeMenu.internal === 'function') unsubscribeMenu.internal()
  unsubscribeMenu.internal = null
}

export default new Vuex.Store({
  state: {
    user: false, // later if no user, it will be set to null (this allows distinguish between 'initial' state & when the user is definitely logged out )
    allowAdmin: false,
    posts: null,
    menu: null,
    requestToLogin: false,
    useTouch: false,
    editorToOpen: null, // could be {type:string, value?:object, onSaved?:function}
    postToOpen: null, // could be {type:string, value?:object|string}
    showDraftsInGrid: false,
    viewCanToggleDrafts: false,
    contentLoaded: false
  },
  mutations: {
    UPDATE_MENU (state, menu) {
      state.menu = menu
    },
    CLEAR_USER (state) {
      state.user = null
    },
    UPDATE_USER (state, user) {
      state.user = user
    },
    REQUEST_LOGIN (state) {
      state.requestToLogin = true
    },
    SET_USE_TOUCH (state) {
      state.useTouch = true
    },
    SET_ALLOW_ADMIN (state, value) {
      state.allowAdmin = value
    },
    SET_EDITOR_TO_OPEN (state, value) {
      state.editorToOpen = value
    },
    SET_POST_TO_OPEN (state, value) {
      state.postToOpen = value
    },
    TOGGLE_DRAFTS_IN_GRID (state) {
      state.showDraftsInGrid = !state.showDraftsInGrid
    },
    SET_VIEW_CAN_TOGGLE_DRAFTS (state, val) {
      state.viewCanToggleDrafts = val
    },
    SET_CONTENT_LOADED (state, val) {
      state.contentLoaded = val
    }
  },
  getters: {
    pageRouteByTitle: state => title => {
      if (typeof title !== 'string') return null
      const titleLC = title.toLowerCase()
      const menuItem = Object.values((state.menu || {}).public || {})
        .find(v => {
          return v.type === 'page' && (v.title || '').toLowerCase() === titleLC
        })
      if (!menuItem) return null
      return { name: 'page', params: { id: menuItem.id } }
    }
  },
  actions: {
    updateWorks ({ commit }, works) {
      commit('UPDATE_WORKS', works)
    },

    logOut: ({ commit }) => Promise.resolve(commit('CLEAR_USER'))
      .then(() => auth.signOut()
        .then(() => {
          if (router.currentRoute.matched.some(record => record.meta.restricted)) {
            router.push({ name: 'home' })
          }
        })
        .catch(err => console.error('signOut:', err))
      ),

    updateUser: ({ commit }, value) => {
      commit('UPDATE_USER', { ...value })
    },

    clearUser ({ commit }) {
      commit('CLEAR_USER')
    },

    requestLogin ({ commit }) {
      commit('REQUEST_LOGIN')
    },

    showEditor ({ commit }, editorInfo) {
      commit('SET_EDITOR_TO_OPEN', editorInfo)
    },

    hideEditor ({ commit }) {
      commit('SET_EDITOR_TO_OPEN', null)
    },

    openPost ({ commit }, postInfo) {
      commit('SET_POST_TO_OPEN', postInfo)
    },

    closePost ({ commit }) {
      commit('SET_POST_TO_OPEN', null)
    },

    setUseTouch ({ commit }) {
      commit('SET_USE_TOUCH')
    },

    toggleDraftsInGrid ({ commit }) {
      commit('TOGGLE_DRAFTS_IN_GRID')
    },

    setViewCanToggleDrafts ({ commit }, val) {
      commit('SET_VIEW_CAN_TOGGLE_DRAFTS', val)
    },

    setContentLoaded ({ commit }) {
      commit('SET_CONTENT_LOADED', true)
    },

    updateMenuSubscription: ({ commit, state }) => {
      const adminOrEditor = () => !!state.user && (state.user.role === 'admin' || state.user.role === 'editor')

      if (!unsubscribeMenu.public) {
        unsubscribeMenu.public = db.collection('settings')
          .doc('publicMenu')
          .onSnapshot(snap => {
            commit('UPDATE_MENU', { ...state.menu, public: (snap.data() || {}).items })
          })
      }
      if (state.user) {
        if (!unsubscribeMenu.internal) {
          unsubscribeMenu.internal = db.collection('settings')
            .doc('internalMenu')
            .onSnapshot(snap => {
              commit('UPDATE_MENU', { ...state.menu, internal: (snap.data() || {}).items })
            })
        }
        if (adminOrEditor()) {
          Object.entries({ programmes: 'draftProgrammes', pages: 'draftPages' })
            .forEach(([collectionId, unsubName]) => {
              if (!unsubscribeMenu[unsubName]) {
                unsubscribeMenu[unsubName] = subscribeCollectionDrafts(
                  collectionId,
                  data => {
                    commit('UPDATE_MENU', {
                      ...state.menu,
                      drafts: {
                        ...state.menu.drafts, [`${collectionId}-${data.id}`]: data
                      }
                    })
                  },
                  id => {
                    const tmp = { ...state.menu.drafts }
                    delete tmp[id]
                    commit('UPDATE_MENU', { ...state.menu, drafts: { ...tmp } })
                  })
              }
            })
        } else {
          unsubscribeDrafts()
          commit('UPDATE_MENU', { ...state.menu, drafts: null })
        }
      } else {
        unsubscribeRestricted()
        commit('UPDATE_MENU', { ...state.menu, internal: null, drafts: null })
      }
    }
  }
})

/**
 * @param {string} collectionId
 * @param {function} onSet
 * @param {function} onDelete
 */
function subscribeCollectionDrafts (collectionId, onSet, onDelete) {
  return db.collection(collectionId)
    .where('status', '==', 'draft')
    .onSnapshot({
      next: querySnapshot => {
        querySnapshot.docChanges().forEach(docChange => {
          const doc = docChange.doc
          switch (docChange.type) {
            case 'added':
            case 'modified':
              const { title, singlePostLabel } = doc.data()
              const data = { id: doc.id, title, type: typeFromCollectionId(collectionId) }
              if (singlePostLabel) data.singlePostLabel = singlePostLabel
              onSet(data)
              break
            case 'removed':
              onDelete(doc.id)
          }
        })
      },
      error: err => {
        console.error(`Subscribe to ${collectionId}:`, err)
      }
    })
}

function typeFromCollectionId (collectionId) {
  switch (collectionId) {
    case 'programmes': return 'programme'
    case 'pages': return 'page'
    default: return collectionId
  }
}
