<template>
  <div class="transfer-wp-posts">
    <div>
      <button :ripple="false" :loading="processing" @click="process">
        Transfer Posts
      </button>
      <button :ripple="false" :loading="processing" @click="transferPost('post', 577)">
        Test First File
      </button>
    </div>
    <div class="main-section">
      <section v-for="(posts, type) in convertedPosts" :key="type">
        <h3>{{postTypeMap[type]}}</h3>
        <div class="posts">
          <div
            v-for="(item, id, i) in posts"
            :key="id"
            class="item">
            <div class="counter">
              <span><b>{{i+1}}</b> ({{id}})</span>
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
            <div>
              {{Math.ceil(item.progress.total)}}
            </div>
          </div>
        </div>
      </section>
    </div>

    <div>
      <strong>{{ Math.ceil(totalProgress) }}%</strong>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import WP from '../../ABA-Data.json'
import { db } from '../../lib/firebase'
// import { transferFile } from '../../lib/image-transfer'
import imgLib from '../../lib/image'
import * as string from '../../lib/string'
import { upload } from '../../lib/storage'

export default {
  name: 'TransferWPPosts',
  components: {
  },

  data: () => ({
    transfered: [],
    profiles: [],
    savedPosts: {},
    totalProgress: 0,
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
    unsubscribePosts: null,
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

    postTypesList () {
      return Object.keys(this.postTypeMap)
    },

    convertedPosts () {
      return Object.entries(this.postTypes).reduce((res, [type, posts]) => {
        res[type] = posts.reduce((res, item) => {
          const post = {
            published: true,
            wpID: parseInt(item.post.ID),
            author: this.postAuthor(item.post.post_author),
            content: item.post.post_content,
            created: this.wpTimeStringToTime(item.post.post_date_gmt),
            modified: this.wpTimeStringToTime(item.post.post_modified_gmt),
            attachments: this.getAttachmentsFromContent(item.post.post_content),
            gallery: this.galleryAttachments(item),
            progress: {
              max: 100,
              parts: {},
              total: 0
            }
          }
          const unique = []
          post.attachments = post.attachments.filter(a => {
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
          res[post.wpID] = post
          return res
        }, {})
        return res
      }, {})
    },

    postsToTransfer () {
      if (!Object.keys(this.savedPosts).length) return {}
      return Object.entries(this.convertedPosts).reduce((res, [type, posts]) => {
        res[type] = Object.entries(posts).reduce((unsavedPosts, [id, post]) => {
          const unsavedPost = { ...post }
          /* DEBUG */
          console.log(`%c type %c: `, 'background:#ffbb00;color:#000', 'color:#00aaff', type)
          /* DEBUG */
          console.log(`%c %c id: `, 'background:#ffbb00;color:#000', 'color:#00aaff', id)
          const savedPost = (this.savedPosts[type] || {})[`wp${id}`] || null
          /* DEBUG */
          console.log(`%c %c savedPost: `, 'background:#ffbb00;color:#000', 'color:#00aaff', savedPost)
          let ok = !!savedPost
          if (ok) {
            const attachments = post.attachmnets.map(attachment => {
              const a = { ...attachment }
              if (!a.mime.startsWith('image/')) ok = false // need to fix wrong inline replacements
              if (savedPost.attachmnets) {
                const savedId = Object.keys(savedPost.attachmnets).find(id => savedPost.attachmnets[id].wpID === attachment.wpID)
                /* DEBUG */
                console.log(`%c savedPost.attachments %c savedId: `, 'background:#ffbb00;color:#000', 'color:#00aaff', savedId)
                if (savedId) {
                  const savedA = savedPost.attachmnets[savedId]
                  /* DEBUG */
                  console.log(`%c attachments %c  savedA: `, 'background:#ffbb00;color:#000', 'color:#00aaff', savedA)
                  if (savedA.full || savedA.preview || savedA.original) {
                    a.savedId = savedId
                  }
                }
              }
              return a
            })
            if (attachments.find(a => !a.savedId)) {
              unsavedPost.attachmnets = attachments
              ok = false
            }

            const gallery = post.gallery.map(attachment => {
              const a = { ...attachment }
              if (savedPost.gallery) {
                /* DEBUG */
                console.log(`%c %c Object.keys(savedPost.gallery): `, 'background:#ffbb00;color:#000', 'color:#00aaff', Object.keys(savedPost.gallery))
                const savedId = Object.keys(savedPost.gallery).find(id => savedPost.gallery[id].wpID === attachment.wpID)
                /* DEBUG */
                console.log(`%c savedPost.gallery %c savedId: `, 'background:#ffbb00;color:#000', 'color:#00aaff', savedId)
                if (savedId) {
                  const savedA = savedPost.gallery[savedId]
                  /* DEBUG */
                  console.log(`%c gallery %c savedA: `, 'background:#ffbb00;color:#000', 'color:#00aaff', savedA)
                  if (savedA.full || savedA.preview || savedA.original) {
                    a.savedId = savedId
                  }
                }
              }
              return a
            })
            if (gallery.find(a => !a.savedId)) {
              unsavedPost.gallery = attachments
              ok = false
            }

            if (!ok) {
              unsavedPosts[id] = unsavedPost
            }
          } else {
            unsavedPosts[id] = unsavedPost
          }
          return unsavedPosts
        }, {})
        return res
      }, {})
    },

    wpAttachments () {
      if (!this.user || this.user.role !== 'admin') return []
      return WP.attachment
    },

    totalPostsCount () {
      return Object.values(this.convertedPosts).reduce((res, posts) => {
        return res + Object.keys(posts).length
      }, 0)
    }
  },

  created () {
    this.unsubscribe = db.collection('profiles')
      .onSnapshot(snapshot => {
        this.profiles = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
      })
    this.unsubscribePosts = []
    this.postTypesList.forEach(type => {
      this.unsubscribePosts.push(db.collection(string.toCamel(type))
        .onSnapshot(snapshot => {
          this.savedPosts[type] = snapshot.docs.reduce((res, doc) => {
            res[doc.id] = { ...doc.data() }
            return res
          }, {})
          this.updateProgressOnSavedPosts()
        })
      )
    })
  },

  destroyed () {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
    if (this.unsubscribePosts && this.unsubscribePosts.length) {
      this.unsubscribePosts.forEach(unsubscribe => unsubscribe())
    }
  },

  methods: {
    updateProgressOnSavedPosts () {
      Object.entries(this.convertedPosts).forEach(([type, posts]) => {
        Object.keys(posts).forEach(id => {
          /* DEBUG */
          console.log(`%c %c this.postsToTransfer: `, 'background:#ffbb00;color:#000', 'color:#00aaff', this.postsToTransfer)
          const unsaved = (this.postsToTransfer[type] || {})[id]
          /* DEBUG */
          console.log(`%c %c unsaved: `, 'background:#ffbb00;color:#000', 'color:#00aaff', unsaved)
          if (this.savedPosts[type] && this.savedPosts[type][`wp${id}`] && !unsaved) {
            this.$set(this.convertedPosts[type][id].progress, 'total', 100)
          }
        })
      })
      this.updateTotalProgress()
    },

    updateTotalProgress () {
      const sumProgress = Object.values(this.convertedPosts).reduce((res, posts) => {
        return res + Object.values(posts).reduce((r, post) => r + (post.progress ? post.progress.total : 0), 0)
      }, 0)
      this.totalProgress = sumProgress / (this.totalPostsCount * 100) * 100
    },

    process () {
      Object.entries(this.convertedPosts).forEach(([type, posts]) => {
        Object.keys(posts).forEach(id => this.transferPost(type, id))
      })
    },

    async transferPost (postType, postId) {
      const post = this.convertedPosts[postType][postId]
      if (!post) {
        console.error(`Cant find Post Id: ${postId} of type: ${postType}!`)
        return
      }
      if (this.savedPosts[postType][`wp${postId}`]) {
        // this.$set(this.convertedPosts[postType][postId].progress, 'total', 100)
        return
      }
      try {
        this.processing = true
        const attachments = await Promise.all(post.attachmnets.map(async a => {
          const file = await imgLib.blobFromUrl(a.url)
          const nameWithFolders = a.url.match(/(\d{4}\/\d{2}\/.*)\..+$/)
          const storageName = nameWithFolders ? nameWithFolders[1].replace(/\//g, '-') : null
          return { ...a, file, id: a.wpID, storageName, placedIn: 'attachments' }
        }))
        const gallery = await Promise.all(post.gallery.map(async a => {
          const file = await imgLib.blobFromUrl(a.url)
          const nameWithFolders = a.url.match(/(\d{4}\/\d{2}\/.*)\..+$/)
          const storageName = nameWithFolders ? nameWithFolders[1].replace(/\//g, '-') : null
          return { ...a, file, id: a.wpID, storageName, placedIn: 'gallery' }
        }))

        const readyAttachments = [...attachments.filter(a => !a.file.error), ...gallery.filter(a => !a.file.error)]

        this.$set(this.convertedPosts[postType][postId].progress, 'max', readyAttachments.length * 100)

        const uploaded = await upload(post.author.uid, readyAttachments, (id, progress) => {
          this.$set(this.convertedPosts[postType][postId].progress.parts, id, progress)
          const sum = Object.values(post.progress.parts).reduce((r, p) => r + p)
          this.$set(this.convertedPosts[postType][postId].progress, 'total', sum / post.progress.max * 100)
          this.updateTotalProgress()
        })

        const replacements = Object.entries(uploaded).reduce((res, [name, item]) => {
          if (item.attachment.toReplace) {
            const imgTag = `<img src="${(item.full || item.original || {}).url}">`
            res.push({
              toReplace: item.attachment.toReplace,
              replacement: item.attachment.caption
                ? `<span class="img-with-caption">${imgTag}<span class="caption">${item.attachment.caption}</span></span>`
                : imgTag
            })
          }
          return res
        }, [])
        let content = post.content
        /* DEBUG */
        replacements.forEach(r => {
          content = content.replace(r.toReplace, r.replacement)
        })

        const { wpID, author, created, modified, excerpt, title, translations } = post
        const postData = { wpID, author, content, created, modified }
        if (excerpt) postData.excerpt = excerpt
        if (title) postData.title = title
        if (translations) postData.translations = translations

        if (post.attachmnets.length) {
          postData.attachmnets = post.attachmnets.reduce((res, attachment) => {
            const fbKey = Object.keys(uploaded).find(key => uploaded[key].attachment.wpID === attachment.wpID)
            const { mime, wpID, url, thumbnail, caption } = attachment
            const id = fbKey || wpID
            res[id] = { mime, wpID, wpUrl: url, wpThumbnail: thumbnail }
            if (caption) res[id].caption = caption
            if (fbKey) {
              res[fbKey] = { mime, wpID, wpUrl: url, wpThumbnail: thumbnail }
              const { full, preview, original } = uploaded[fbKey]
              if (full) res[fbKey].full = full
              if (preview) res[fbKey].preview = preview
              if (original) res[fbKey].original = original
            }
            return res
          }, {})
        }
        if (post.gallery.length) {
          postData.gallery = post.gallery.reduce((res, attachment) => {
            const fbKey = Object.keys(uploaded).find(key => uploaded[key].attachment.wpID === attachment.wpID)
            console.log(`%c %c fbKey: `, 'background:#ffbb00;color:#000', 'color:#00aaff', fbKey)
            const { mime, wpID, url, thumbnail } = attachment
            if (fbKey) {
              res[fbKey] = { mime, wpID, wpUrl: url, wpThumbnail: thumbnail }
              const { full, preview, original } = uploaded[fbKey]
              if (full) res[fbKey].full = full
              if (preview) res[fbKey].preview = preview
              if (original) res[fbKey].original = original
            } else {
              res[wpID] = { mime, wpID, wpUrl: url, wpThumbnail: thumbnail }
            }
            return res
          }, {})
        }

        const type = string.toCamel(postType)
        const pId = `wp${wpID}`
        await db.collection(type).doc(pId).set(postData, { merge: true })

        this.$set(this.convertedPosts[postType][postId].progress, 'total', 100)

        this.processing = false
      } catch (err) {
        /* DEBUG */
        console.log(`%c transferPost %postType, postIdc err: `, 'background:#ffbb00;color:#000', 'color:#00aaff', err)
      }
      // const firstUrl = `${this.publicPath}test.jpg` // WP.attachment[0].post.url
      // transferFile(firstUrl)
    },

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

    /**
     * @param {string} content
     * @return {{
     *  wpID: number,
     *  toReplace: string,
     *  url: string,
     *  thumbnail: string|null,
     *  caption: string|null,
     *  mime: string
     * }[]}
     */
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
        // text = text.replace(match[0], '')
      }
      attachments.forEach(a => {
        text = text.replace(a.toReplace, '')
      })
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
        // text = text.replace(match[0], '')
      }
      attachments.forEach(a => {
        text = text.replace(a.toReplace, '')
      })
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
        // text = text.replace(match[0], '')
      }
      attachments.forEach(a => {
        text = text.replace(a.toReplace, '')
      })
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
        // text = text.replace(match[0], '')
      }
      attachments.forEach(a => {
        text = text.replace(a.toReplace, '')
      })
      return { attachments, text }
    },

    getAttachment (id) {
      return WP.attachment.find(a => a.post.ID === id)
    },

    getAttachmentUrl (item) {
      const url = item && item.post && item.post.url ? item.post.url : null
      if (url) return url
      return null
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
