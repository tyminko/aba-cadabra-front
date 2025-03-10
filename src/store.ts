import { createStore } from 'vuex'
import router from './router'
import { auth, db } from './lib/firebase'
import { collection, doc, onSnapshot, query, where } from '@firebase/firestore'

interface UnsubscribeMenu {
  public: null | (() => void)
  internal: null | (() => void)
  draftProgrammes: null | (() => void)
  draftPages: null | (() => void)
  [key: string]: null | (() => void)
}

interface MenuItem {
  id: string
  title: string
  type: string
  singlePostLabel?: string
}

interface MenuState {
  public: Record<string, MenuItem>
  internal: Record<string, MenuItem>
  drafts: Record<string, MenuItem>
}

interface User {
  uid: string
  displayName: string | null
  email: string | null
  emailVerified: boolean
  phoneNumber: string | null
  photoURL: string | null
  role: string
}

interface State {
  user: User | null
  menu: MenuState | null
}

const unsubscribeMenu: UnsubscribeMenu = {
  public: null,
  internal: null,
  draftProgrammes: null,
  draftPages: null
}

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

const store = createStore<State>({
  state: {
    user: null,
    menu: null
  },

  mutations: {
    UPDATE_MENU (state: State, menu: MenuState) {
      state.menu = menu
    },
    CLEAR_USER (state: State) {
      state.user = null
    },
    UPDATE_USER (state: State, user: User | null) {
      // For mock user, ensure role is set
      if (user && !user.role) {
        user.role = 'admin'
      }
      state.user = user
    }
  },

  getters: {
    pageRouteByTitle: (state) => (title: string) => {
      if (typeof title !== 'string') return null
      const titleLC = title.toLowerCase()
      const menuItem = Object.values((state.menu || {}).public || {})
        .find((v: MenuItem) => {
          return v.type === 'page' && (v.title || '').toLowerCase() === titleLC
        })
      if (!menuItem) return null
      return { name: 'page', params: { id: menuItem.id } }
    }
  },

  actions: {
    signOut: ({ commit }) => {
      Promise.all([
        new Promise(resolve => {
          unsubscribeRestricted()
          resolve(true)
        })
      ])
        .then(() => auth.signOut()
          .then(() => {
            if (router.currentRoute.value.matched.some(record => record.meta.restricted)) {
              router.push({ name: 'home' })
            }
          })
          .catch(err => console.error('signOut:', err))
        )
    },

    setUser ({ commit }, user: User | null) {
      if (!user) {
        commit('CLEAR_USER')
        return
      }
      // For mock environment, always treat as admin
      if (user && !user.role) {
        user.role = 'admin'
      }
      commit('UPDATE_USER', user)
    },

    updateMenuSubscription: ({ commit, state }) => {
      const adminOrEditor = () => !!state.user && (state.user.role === 'admin' || state.user.role === 'editor')

      if (!unsubscribeMenu.public) {
        unsubscribeMenu.public = onSnapshot(
          doc(db, 'settings', 'publicMenu'),
          snap => {
            commit('UPDATE_MENU', { ...state.menu, public: (snap.data() || {}).items })
          }
        )
      }
      if (state.user) {
        if (!unsubscribeMenu.internal) {
          unsubscribeMenu.internal = onSnapshot(
            doc(db, 'settings', 'internalMenu'),
            snap => {
              commit('UPDATE_MENU', { ...state.menu, internal: (snap.data() || {}).items })
            }
          )
        }
        if (adminOrEditor()) {
          Object.entries({ programmes: 'draftProgrammes', pages: 'draftPages' })
            .forEach(([collectionId, unsubName]) => {
              if (!unsubscribeMenu[unsubName]) {
                unsubscribeMenu[unsubName] = subscribeCollectionDrafts(
                  collectionId,
                  (data: MenuItem) => {
                    commit('UPDATE_MENU', {
                      ...state.menu,
                      drafts: {
                        ...(state.menu?.drafts || {}),
                        [`${collectionId}-${data.id}`]: data
                      }
                    })
                  },
                  (id: string) => {
                    const tmp = { ...(state.menu?.drafts || {}) }
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
 * Subscribe to collection drafts
 * @param {string} collectionId
 * @param {function} onSet
 * @param {function} onDelete
 */
function subscribeCollectionDrafts (
  collectionId: string,
  onSet: (data: MenuItem) => void,
  onDelete: (id: string) => void
) {
  return onSnapshot(
    query(collection(db, collectionId), where('status', '==', 'draft')),
    {
      next: querySnapshot => {
        querySnapshot.docChanges().forEach(docChange => {
          const doc = docChange.doc
          switch (docChange.type) {
            case 'added':
            case 'modified': {
              const { title, singlePostLabel } = doc.data()
              const data: MenuItem = { id: doc.id, title, type: typeFromCollectionId(collectionId) }
              if (singlePostLabel) data.singlePostLabel = singlePostLabel
              onSet(data)
              break
            }
            case 'removed':
              onDelete(`${collectionId}-${doc.id}`)
              break
          }
        })
      },
      error: (err: Error) => {
        console.error(`Subscribe to ${collectionId}:`, err)
      }
    }
  )
}

function typeFromCollectionId (collectionId: string): string {
  switch (collectionId) {
    case 'programmes': return 'programme'
    case 'pages': return 'page'
    default: return collectionId
  }
}

export default store
