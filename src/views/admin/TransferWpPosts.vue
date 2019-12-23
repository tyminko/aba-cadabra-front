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
                  {{lng}}
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
            <div class="attachments">
              <div
                v-for="attach in [...item.attachmnets, ...item.gallery]"
                :key="attach.wpID"
                :class="{file:!attach.mime.startsWith('image/')}"
                class="attach-box" >
                <img
                  v-if="attach.mime.startsWith('image/')"
                  :src="attach.thumbnail">
                <span v-else>{{attach.mime.split('/').pop()}}</span>
              </div>
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
            attachmnets: this.getAttachmentsFromContent(item.post.post_content),
            gallery: this.galleryAttachments(item)
          }
          const unique = []
          post.attachmnets = post.attachmnets.filter(a => {
            if (unique.includes(a.wpID)) return false
            unique.push(a.wpID)
            return true
          })
          post.gallery = post.gallery.filter(a => {
            if (unique.includes(a.wpID)) return false
            unique.push(a.wpID)
            return true
          })

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

    galleryAttachments (wpPost) {
      return (wpPost.meta.gallery || []).map(wpID => {
        wpID = parseInt(wpID)
        const attachment = this.getAttachment(wpID)
        return {
          wpID,
          url: this.getAttachmentUrl(attachment),
          thumbnail: attachment ? this.thumbnailUrl(attachment) : null,
          mime: attachment ? attachment.post.post_mime_type : null
        }
      })
    },

    getAttachmentsFromContent (content) {
      let res = this.extractImagesWithWpCaptions({ attachments: [], text: content })
      res = this.extractImagesWithWpID(res)
      res = this.extractABAImages(res)
      res = this.extractABAFileLinks(res)
      return res.attachments
    },

    extractImagesWithWpCaptions ({ attachments, text }) {
      const regex = /\[caption\s*id=".*?(\d+)".*?<img.*?>\s*(.*?)\[\/caption\]/g
      let match
      while ((match = regex.exec(text)) !== null) {
        const wpID = parseInt(match[1])
        const attachment = this.getAttachment(wpID)
        attachments.push({
          toReplace: match[0],
          wpID,
          url: this.getAttachmentUrl(attachment),
          thumbnail: attachment ? this.thumbnailUrl(attachment) : null,
          caption: match[2],
          mime: attachment ? attachment.post.post_mime_type : null
        })
        text = text.replace(match[0], '')
      }
      return { attachments, text }
    },

    extractImagesWithWpID ({ attachments, text }) {
      const regex = /<img.*?wp-image-(\d+).*?>/g
      let match
      while ((match = regex.exec(text)) !== null) {
        const wpID = parseInt(match[1])
        const attachment = this.getAttachment(wpID)
        attachments.push({
          toReplace: match[0],
          wpID,
          url: this.getAttachmentUrl(attachment),
          thumbnail: attachment ? this.thumbnailUrl(attachment) : null,
          caption: null,
          mime: attachment ? attachment.post.post_mime_type : null
        })
        text = text.replace(match[0], '')
      }
      return { attachments, text }
    },

    extractABAImages ({ attachments, text }) {
      const regex = /<img.*?src="http:\/\/airberlinalexanderplatz\.de\/wp-content\/uploads\/\d{4}\/\d+\/(.*?)".*?>/g
      let match
      while ((match = regex.exec(text)) !== null) {
        const fileName = match[1]
        const attachment = this.getAttachmentByFileName(fileName)
        attachments.push({
          toReplace: match[0],
          wpID: attachment ? attachment.post.ID : null,
          url: this.getAttachmentUrl(attachment),
          thumbnail: attachment ? this.thumbnailUrl(attachment) : null,
          caption: null,
          mime: attachment ? attachment.post.post_mime_type : null
        })
        text = text.replace(match[0], '')
      }
      return { attachments, text }
    },

    extractABAFileLinks ({ attachments, text }) {
      const regex = /<a.*?href="(http:\/\/airberlinalexanderplatz\.de\/wp-content\/uploads\/\d{4}\/\d+\/(.*?))".*?>.*?<\/a>/g
      let match
      while ((match = regex.exec(text)) !== null) {
        const fileName = match[2]
        const attachment = this.getAttachmentByFileName(fileName)
        attachments.push({
          toReplace: match[1],
          wpID: attachment ? attachment.post.ID : null,
          url: this.getAttachmentUrl(attachment),
          thumbnail: attachment ? this.thumbnailUrl(attachment) : null,
          caption: null,
          mime: attachment ? attachment.post.post_mime_type : null
        })
        text = text.replace(match[0], '')
      }
      return { attachments, text }
    },

    getAttachment (id) {
      return WP.attachment.find(a => a.post.ID === id)
    },

    getAttachmentUrl (item) {
      return item && item.post && item.post.url ? item.post.url : null
    },

    getAttachmentByFileName (fileName) {
      return WP.attachment.find(a => {
        if (a.meta._wp_attached_file.split('/').pop() === fileName) return true
        let found = false
        const m = a.meta._wp_attachment_metadata
        if (m) {
          if (m.file && m.file.split('/').pop() === fileName) return true
          if (m.sizes) {
            Object.values(m.sizes).forEach(s => {
              if (s.file === fileName) found = true
            })
            if (found) return true
          }
        }
        if (a.meta._wp_attachment_backup_sizes) {
          Object.values(a.meta._wp_attachment_backup_sizes).forEach(s => {
            if (s.file === fileName) found = true
          })
          if (found) return true
        }
        return false
      })
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
            text-transform: uppercase;
            cursor: pointer;
            .active {
              font-weight: 900;
            }
          }
        }
        .attachments {
          display: flex;

          flex-flow: row wrap;

          .attach-box {
            flex: 1 1 20px;
            margin-bottom: 2px;
            max-height: 30px;
            max-width: 60px;
            text-transform: uppercase;

            &.file {
              display: flex;
              align-items: center;
              justify-content: center;
              background: #0000ff;
              color: #fff;
            }

            &:not(:last-child) {
              margin-right: 2px;
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
    }
  }
</style>
