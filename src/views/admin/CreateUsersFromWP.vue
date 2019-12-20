<template>
  <div class="create-users-from-wp">
    <div>
      <v-btn :ripple="false" :loading="processing" @click="updateUsers">
        Create From WP
      </v-btn>
      <v-btn :ripple="false" color="red" :disabled="true" :loading="processing" @click="deleteUsers">
        Delete All
      </v-btn>
    </div>
    <div class="list">
      <ol class="user-info">
        <li v-for="userData in wpUsers"
            :key="userData.user.ID"
            :class="{'user-exists': userExists(userData.user.email), 'updated': userUpdated(userData.user.email)}">
          {{userData.user.display_name}}
        </li>
      </ol>
    </div>
    <v-progress-linear
      v-model="done"
      color="blue-grey"
      height="25"
      reactive >
      <template v-slot="{ value }">
        <strong>{{ Math.ceil(value) }}%</strong>
      </template>
    </v-progress-linear>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as users from '../../lib/users'
import { db } from '../../lib/firebase'
import ABADb from '../../ABA-Data.json'

export default {
  name: 'CreateUsersFromWP',
  components: {
  },

  props: {
  },

  data: () => ({
    fbUsers: [],
    updatedUsers: [],
    errors: {},
    profiles: [],
    profilesRef: db.collection('profiles'),
    processing: false,
    unsubscribe: null
  }),

  created () {
    this.getExistingUsers()
    this.unsubscribe = db.collection('profiles')
      .onSnapshot(snapshot => {
        this.profiles = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
      })
  },

  watch: {
    fbUsers () {
      this.checkForProfileUpdates()
    },
    profiles () {
      this.checkForProfileUpdates()
    }
  },

  destroyed () {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },

  computed: {
    ...mapState(['user']),
    wpUsers () {
      if (!this.user || this.user.role !== 'admin') return []
      return ABADb.users
    },
    done () {
      return this.updatedUsers.length / this.wpUsers.length * 100
    }
  },

  methods: {
    checkForProfileUpdates () {
      this.profiles.forEach(profile => {
        const fbUser = this.fbUsers.find(u => u.uid === profile.uid)
        if (!fbUser) return
        const wpUserData = this.wpUsers.find(u => u.user.email.toLowerCase() === fbUser.email)
        if (!wpUserData) return
        const fieldsToUpdate = this.profileFieldsToUpdate(profile, wpUserData)
        if (!Object.keys(fieldsToUpdate).length) {
          if (!this.updatedUsers.find(u => u.uid === profile.uid)) {
            this.updatedUsers.push(profile)
          }
        } else {
          this.profilesRef.doc(fbUser.uid).update(fieldsToUpdate)
            .then(() => {
              if (!this.updatedUsers.find(u => u.uid === profile.uid)) {
                this.updatedUsers.push(profile)
              }
            })
            .catch(err => {
              /* DEBUG */
              console.error(`%c ${err.code} %c: `, 'background:#ff0000;color:#000', 'color:#00aaff', err)
            })
        }
      })
    },

    async getExistingUsers () {
      if (this.user && this.user.role === 'admin') {
        this.fbUsers = await users.getAll()
      } else {
        this.fbUsers = []
      }
    },

    userExists (email) {
      return this.fbUsers.find(u => u.email === email.toLowerCase())
    },

    deleteUsers () {
      this.fbUsers.forEach((u, i) => {
        if (u.email === 'tyminko@gmail.com') return
        setTimeout(async () => {
          this.processing = true
          const res = await users.remove(u.uid)
          this.processing = false
          if (res) {
            const index = this.fbUsers.findIndex(us => us.uid === u.uid)
            if (index > -1) this.fbUsers.splice(index, 1)
          }
        }, i * 4000)
      })
    },

    userUpdated (email) {
      const user = this.fbUsers.find(u => u.email === email)
      if (!user) return false
      return this.updatedUsers.find(u => u.uid === user.uid)
    },

    updateUsers () {
      this.wpUsers.forEach(async wpUserData => {
        const wpUser = wpUserData.user
        let fbUser = this.userExists(wpUser.email)
        if (!fbUser) {
          fbUser = await this.createUser(wpUser)
          if (fbUser) {
            this.fbUsers.push(fbUser)
          } else {
            /* DEBUG */
            console.error(`%c createUser %c: `, 'background:#ff0000;color:#000', 'color:#00aaff', wpUser)
          }
        }
      })
    },

    async createUser (wpUser) {
      const userData = {
        displayName: wpUser.display_name,
        email: wpUser.email,
        password: users.generatePassword(),
        phoneNumber: '',
        photoURL: '',
        emailVerified: false,
        disabled: false,
        role: this.mapWpRole(wpUser.roles[0])
      }
      return users.addUser(userData)
    },

    profileFieldsToUpdate (profile, wpUserData) {
      const fields = [
        'displayName',
        'description',
        'links',
        'abaPosition',
        'country',
        'memberOfProgrammes',
        'residencyStart',
        'residencyEnd',
        'sponsoredBy',
        'vip',
        'wpID',
        'wpAbaStaffOrder',
        'wpGallery',
        'registered'
      ]
      return fields.reduce((fields, field) => {
        const wpValue = this.wpValueForFiled(field, wpUserData)
        if (!profile.hasOwnProperty(field) || profile.field !== wpValue) {
          fields[field] = wpValue
        }
        return fields
      }, {})
    },

    mapWpRole (role) {
      switch (role) {
        case 'administrator':
          return 'admin'
        case 'editor':
          return 'editor'
        case 'guest':
        case 'resident':
          return 'contributor'
        case 'subscriber':
          return 'visitor'
        default:
          return 'visitor'
      }
    },

    wpValueForFiled (profileField, wpUserData) {
      switch (profileField) {
        case 'displayName':
          return wpUserData.user.display_name || ''
        case 'description':
          return wpUserData.meta.description || ''
        case 'links':
          return [
            wpUserData.user.user_url,
            wpUserData.meta.twitter,
            wpUserData.meta.facebook,
            wpUserData.meta.instagram
          ].filter(link => !!link)
        case 'abaPosition':
          return wpUserData.meta.aba_position || wpUserData.user.roles[0] || null
        case 'country':
          return wpUserData.meta.country || null
        case 'memberOfProgrammes':
          return (wpUserData.meta.programme || []).filter(x => !!x)
        case 'residencyStart':
          return this.wpTimestampToTime(wpUserData.meta.residency_start || null)
        case 'residencyEnd':
          return this.wpTimestampToTime(wpUserData.meta.residency_end || null)
        case 'sponsoredBy':
          return parseInt(wpUserData.meta.institution) || null
        case 'vip':
          return !!wpUserData.meta.vip
        case 'wpID':
          return wpUserData.user.ID
        case 'wpAbaStaffOrder':
          return wpUserData.meta.aba_staff_order || null
        case 'wpGallery':
          return (wpUserData.meta.gallery || []).map(s => parseInt(s))
        case 'registered':
          return this.wpTimeStringToTime(wpUserData.user.user_registered) || new Date().getTime()
      }
    },
    wpTimestampToTime (wpTimestamp) {
      const int = parseInt(wpTimestamp)
      if (!Number.isInteger(int)) return null
      return new Date(int * 1000).getTime()
    },
    wpTimeStringToTime (wpTimeString) {
      const time = new Date(wpTimeString).getTime()
      return Number.isInteger(time) ? time : null
    }
  }
}
</script>

<style lang='scss'>
  .create-users-from-wp{
    display: flex;
    flex-flow: column;
    align-items: flex-start;
    height: calc(100vh - 76px);

    & > * {
      flex-shrink: 0
    }

    .list {
      flex-shrink: 1;
      flex-grow: 1;
      overflow: auto;
      margin: 20px 0;
      width: 100%;

      .user-info {
        padding-left: 50px;

        .user-exists {
          background: greenyellow;
        }
        .updated {
          background: rgb(94, 156, 0);
          color: white;
        }
      }
    }

    .progress {
      position: relative;
      height: 20px;
      width: 100%;
      .progress-indicator {
        position: absolute;
        height: 100%;

      }
    }
  }
</style>
