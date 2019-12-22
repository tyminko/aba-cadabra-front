<template>
  <div class="transfer-wp-posts">
    <div>
      <v-btn :ripple="false" :loading="processing" @click="process">
        Transfer Posts
      </v-btn>
    </div>
    <div class="main-section">
      <section v-for="(posts, type) in convertedPosts" :key="type">
        <h3>{{postTypeMap[type]}}</h3>
        <div class="posts">
          <div
            v-for="(item, i) in posts"
            :key="item.wpID"
            class="item">
            <div class="counter">
              <span><b>{{i+1}}</b> ({{item.wpID}})</span>
              <span v-if="item.translations" class="trans">
                <span
                  v-for="(trans, lng) in item.translations"
                  :key="lng"
                  :class="{active:lang===lng}"
                  @click="lang=lng">
                  {{lng.toUpperCase()}}
                </span>
              </span>
            </div>
            <h5>{{item.author ? item.author.displayName : '--'}}</h5>
            <template v-if="item.translations">
              {{(item.translations[lang] ? item.translations[lang].title : (item.translations.en ? item.translations.en.title : item.title || ''))}}
            </template>
            <template v-else>
              {{item.title || ''}}
            </template>
            <div class="images">
            <!-- <img
              v-if="item.post.post_mime_type.startsWith('image/')"
              :src="thumbnailUrl(item)"> -->
            </div>
          </div>
        </div>
      </section>
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
import WP from '../../ABA-Data.json'
import { db } from '../../lib/firebase'

export default {
  name: 'TransferWPPosts',
  components: {
  },

  data: () => ({
    transfered: [],
    profiles: [],
    processing: false,
    postTypeMap: {
      'post': 'Posts',
      'diary_post': 'Diary Posts',
      'salons': 'Salons',
      'programme': 'Programmes',
      'lab': 'Lab',
      'publications': 'Publications'
    },
    unsubscribe: null,
    lang: 'en'
  }),

  computed: {
    ...mapState(['user']),

    postTypes () {
      if (!this.user || this.user.role !== 'admin') return []
      return Object.entries(WP).reduce((res, [key, posts]) => {
        if (key === 'attachment' || key === 'users' || key === 'page') return res
        res[key] = posts
        return res
      }, {})
    },

    convertedPosts () {
      return Object.entries(this.postTypes).reduce((res, [type, posts]) => {
        res[type] = posts.map(item => {
          const post = {
            wpID: parseInt(item.post.ID),
            author: this.postAuthor(item.post.post_author),
            content: item.post.post_content,
            created: this.wpTimeStringToTime(item.post.post_date_gmt),
            modified: this.wpTimeStringToTime(item.post.post_modified_gmt),
            images: this.extractImagesFromContent(item.post.post_content)
          }
          if (item.post.post_excerpt) {
            post.excerpt = item.post.post_excerpt
          }
          if (item.post.post_title) {
            post.title = item.post.post_title
            const translations = this.getTitleTrans(item.post)
            if (translations) {
              post.translations = this.mergePostTranslations((post.translations || {}), translations)
            }
          }
          return post
        })
        return res
      }, {})
    },

    wpAttachments () {
      if (!this.user || this.user.role !== 'admin') return []
      return WP.attachment
    },

    done () {
      return this.transfered.length / this.wpAttachments.length * 100
    }
  },

  created () {
    this.unsubscribe = db.collection('profiles')
      .onSnapshot(snapshot => {
        this.profiles = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
      })
  },

  destroyed () {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },

  methods: {
    process () {},

    postAuthor (wpAuthorId) {
      const profile = this.profiles.find(profile => profile.wpID === parseInt(wpAuthorId))
      if (!profile) return null
      const { displayName, uid } = profile
      return { displayName, uid }
    },

    extractImagesFromContent (content) {
      const captionsMatches = content.match(/\[caption\s*id=".*?(\d+)".*?<img.*?>\s*(.*?)\[\/caption\]/g)
      if (captionsMatches) {
        return captionsMatches.map(match => {
          const attachment = this.getAttachment(match[1])
          return {
            toReplace: match[0],
            id: match[1],
            url: this.getAttachmentUrl(attachment),
            thumbnail: attachment ? this.thumbnailUrl(attachment) : null,
            caption: match[2]
          }
        })
      }
      return []
    },

    getAttachment (id) {
      return WP.attachment.find(a => a.post.ID === id)
    },

    getAttachmentUrl (item) {
      return item && item.post && item.post.url ? item.post.url : null
    },

    thumbnailUrl (item) {
      const thumbFile = item.meta._wp_attachment_metadata
        ? (item.meta._wp_attachment_metadata.sizes
          ? (item.meta._wp_attachment_metadata.sizes.thumbnail
            ? item.meta._wp_attachment_metadata.sizes.thumbnail.file
            : null)
          : null)
        : null
      if (!thumbFile) return item.post.url
      const base = item.post.url.split('/')
      base.pop()
      return base.join('/') + '/' + item.meta._wp_attachment_metadata.sizes.thumbnail.file
    },

    wpTimeStringToTime (wpTimeString) {
      const time = new Date(wpTimeString).getTime()
      return Number.isInteger(time) ? time : null
    },

    /**
     * example: {en: {title: String, content: String}, de: {title: String}}
     * @param { Object<string,Object<string,string>> } postTranslations
     * @param { Object<string,Object<string,string>> } newTranslations
     * @return { Object<string,Object<string,string>> }
     */
    mergePostTranslations (postTranslations, newTranslations) {
      const merged = {}
      Object.entries(newTranslations).forEach(([lng, trans]) => {
        merged[lng] = { ...(postTranslations[lng] || {}), ...trans }
      })
      return merged
    },

    /**
     * @param {object} wpPost
     * @return {Object<string,{title:string}>}
     */
    getTitleTrans (wpPost) {
      if (!wpPost.post_title_langs) return null
      const langs = Object.keys(wpPost.post_title_langs)
      if (!langs.length) return null
      const translations = {}
      langs.forEach(lng => {
        const reg = new RegExp(`\\[:${lng}](.*?)\\[`)
        const match = wpPost.post_title_ml.match(reg)
        if (match) {
          const trans = this.cleanupString(match[1])
          if (lng !== 'en' &&
                  translations.en &&
                  translations.en === trans) {
            return
          }
          translations[lng] = {
            title: trans
          }
        }
      })
      const trasLangs = Object.keys(translations)
      if (!trasLangs.length) return null
      if (trasLangs.length === 1 &&
          translations[trasLangs[0]].title === this.cleanupString(wpPost.post_title)) {
        return null
      }
      return translations
    },

    cleanupString (str) {
      return str.replace(/^\s+|\s+$/, '').replace(/ {2,}/, ' ')
    }
  }
}
</script>

<style lang='scss'>
  .transfer-wp-posts{
    display: flex;
    flex-flow: column;
    align-items: flex-start;
    height: calc(100vh - 76px);

    & > * {
      flex-shrink: 0;
    }
    .main-section {
      flex-shrink: 1;
      flex-grow: 1;
      overflow: auto;
      margin: 20px 0;
      width: 100%;

      section {
        width: 100%;
        h3 {
          color: #0000ff;
          margin-bottom: 10px;
        }
      }
    }
    .posts {
      width: 100%;
      margin: 0 0 20px 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      grid-template-rows: auto;
      gap: 10px;
      width: 100%;

      .item {
        font-size: 90%;
        overflow: hidden;
        height: 150px;

        .counter {
          display: flex;

          font-size: 80%;
          color: #0000ff;

          .trans {
            margin: 0 5px 0 auto;
            padding: 0 5px;
            cursor: pointer;
            .active {
              font-weight: 900;
            }
          }
        }

        img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
</style>
