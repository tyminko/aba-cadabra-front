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
        <h3>{{postTypeMap[type] || type}}</h3>
        <div class="posts">
          <div
            v-for="(item, id, i) in posts"
            :key="id"
            class="item">
            <div class="counter">
              <span><b>{{i+1}}</b> ({{id}})</span>
              <div class="trans" @click="transferPost(type, id)">▲</div>
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
              {{(item.translations[lang] ? item.translations[lang].title : (item.translations.en ?
              item.translations.en.title : item.title || ''))}}
            </template>
            <template v-else>
              {{item.title || ''}}
            </template>
            <div class="attachments">
              <div
                v-for="attach in [...(item.attachments||[]), ...(item.gallery||[])]"
                :key="attach.wpID"
                :class="{file:!attach.mime.startsWith('image/')}"
                class="attach-box">
                <img
                  v-if="attach.mime.startsWith('image/')"
                  :src="attach.thumbnail">
                <span v-else>{{attach.mime.split('/').pop()}}</span>
              </div>
            </div>
            <progress-bar :value="item.progress.total" show-percentage/>
          </div>
        </div>
      </section>
    </div>
    <progress-bar :value="totalProgress" show-percentage/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
// import axios from 'axios'
// import jsonpAdapter from 'axios-jsonp'
// import WP from '../../ABA-Data.json'
import WP from '../../ABA-Data-2.json'
import { db, storage } from '../../lib/firebase'
// import { transferFile } from '../../lib/image-transfer'
import imgLib from '../../lib/image'
import * as string from '../../lib/string'
import { upload } from '../../lib/storage'
import ProgressBar from '../components/UI/ProgressBar'

export default {
  name: 'TransferWPPosts',
  components: { ProgressBar },

  data: () => ({
    transfered: [],
    profiles: [],
    savedPosts: {},
    programmes: [],
    totalProgress: 0,
    processing: false,
    postTypeMap: {
      'post': 'Posts',
      'diary_post': 'Diary Posts',
      'salons': 'Salons',
      'event': 'Events',
      'programme': 'Programmes',
      'lab': 'Lab',
      'publications': 'Publications'
    },
    unsubscribe: null,
    unsubscribePosts: null,
    lang: 'en',
    uploadedAttachments: [],
    uploadedAttachmentNames: [],
    uploadedFiles: [],
    errorFiles: [],
    errorPosts: []
    // WP: null
  }),

  computed: {
    ...mapState(['user']),

    allMetaFields () {
      const metaMap = Object.values(this.postsByType).reduce((metaMap, posts) => {
        const typeMetaMap = posts.reduce((res, post) => {
          if (typeof post.meta === 'object') {
            const map = Object.keys(post.meta).reduce((map, key) => {
              if (key === 'institution') {
                // !!! DEBUG !!!
                console.log(`%c () %c ${post.post.post_type} ${post.post.ID} meta[${key}]: `, 'background:#ffbb11;color:#000', 'color:#00aaff', post.meta[key])
              }
              map[key] = true
              return map
            }, {})
            res = { ...res, ...map }
          }
          return res
        }, [])
        metaMap = { ...metaMap, ...typeMetaMap }
        return metaMap
      }, {})
      return Object.keys(metaMap).filter(key => !key.startsWith('_'))
    },

    postsByType () {
      if (!this.user || this.user.role !== 'admin') return []
      return Object.entries(WP).reduce((res, [key, posts]) => {
        if (key === 'attachment' || key === 'users' || key === 'page') return res
        // const type = key === 'programme' || key === 'salons' ? 'event' : key
        res[key] = posts
        return res
      }, {})
    },

    postTypesList () {
      return Object.keys(this.postTypeMap)
    },

    wpUsers () {
      if (!this.user || this.user.role !== 'admin') return []
      return WP.users
    },

    convertedPosts () {
      return Object.entries(this.postsByType).reduce((res, [type, posts]) => {
        // let postType = ''
        // switch (type) {
        //   case 'salons':
        //   case 'lab':
        //   case 'programme':
        //     postType = 'event'
        //     break
        //   case 'diary_post':
        //     postType = 'post'
        //     break
        //   default:
        //     postType = type
        // }
        res[type] = posts.reduce((postsOfType, postRawData) => {
          if (this.savedPosts[`wp${postRawData.post.ID}`]) return postsOfType
          const post = {
            status: 'public',
            wpID: parseInt(postRawData.post.ID),
            author: this.postAuthor(postRawData.post.post_author),
            content: postRawData.post.post_content,
            created: this.wpTimeStringToTime(postRawData.post.post_date_gmt),
            modified: this.wpTimeStringToTime(postRawData.post.post_modified_gmt),
            attachments: this.getAttachmentsFromContent(postRawData.post.post_content),
            gallery: this.galleryAttachments(postRawData),
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

          if (postRawData.post.post_excerpt) {
            post.excerpt = postRawData.post.post_excerpt
          }
          if (postRawData.post.post_title) {
            post.title = postRawData.post.post_title
            const translations = this.getTitleTrans(postRawData.post)
            if (translations) {
              post.translations = this.mergePostTranslations((post.translations || {}), translations)
            }
          }
          if (typeof postRawData.meta === 'object') {
            Object.entries(postRawData.meta).forEach(([key, value]) => {
              switch (key) {
                case 'ends':
                  if (value) {
                    post.endDate = new Date(value).getTime()
                    if (!post.date) post.date = post.endDate
                  }
                  break
                case 'end_date':
                  if (value) {
                    post.endDate = new Date(value.replace(/^(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).getTime()
                    if (!post.date) post.date = post.endDate
                  }
                  break
                case 'starts':
                  if (value) { post.date = new Date(value).getTime() }
                  break
                case 'salon_date':
                  if (value) {
                    post.date = new Date(value.replace(/^(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).getTime()
                  }
                  break
                case 'salon_number':
                  if (value) { post.countNumber = value }
                  break
                case 'salon_location':
                  if (value) { post.location = value }
                  break
                case 'institution':
                  if (value) {
                    const inst = this.postsByType.institutions.find(i => parseInt(i.post.ID) === parseInt(value))
                    if (inst) {
                      post.supportedBy = [{ name: inst.post.post_title, id: `wp${value}` }]
                    }
                  }
                  break
                case 'website':
                  if (value) { post.website = value }
                  break
                case 'country':
                  if (value) { post.country = value }
              }
            })
          }
          if (!post.date) {
            post.date = post.created
          }
          postsOfType[post.wpID] = post
          return postsOfType
        }, {})
        return res
      }, {})
    },

    postsToTransfer () {
      if (!Object.keys(this.savedPosts).length) return {}
      return Object.entries(this.convertedPosts).reduce((res, [type, posts]) => {
        res[type] = Object.entries(posts).reduce((unsavedPosts, [id, post]) => {
          const unsavedPost = { ...post }
          const savedPost = (this.savedPosts[type] || {})[`wp${id}`] || null
          let ok = !!savedPost
          if (ok) {
            const attachments = (post.attachmnets || []).map(attachment => {
              const a = { ...attachment }
              if (!a.mime.startsWith('image/')) ok = false // need to fix wrong inline replacements
              if (savedPost.attachmnets) {
                const savedId = Object.keys(savedPost.attachmnets).find(id => savedPost.attachmnets[id].wpID === attachment.wpID)
                if (savedId) {
                  const savedA = savedPost.attachmnets[savedId]
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
                const savedId = Object.keys(savedPost.gallery).find(id => savedPost.gallery[id].wpID === attachment.wpID)
                if (savedId) {
                  const savedA = savedPost.gallery[savedId]
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

  async created () {
    const snapshot = await db.collection('programmes').get()
    this.programmes = snapshot.docs.reduce((res, doc) => {
      res[doc.id] = doc.data()
      return res
    }, {})
    this.unsubscribe = db.collection('profiles')
      .onSnapshot(snapshot => {
        this.profiles = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
      })
    this.unsubscribePosts = []
    this.unsubscribePosts.push(db.collection('posts')
      .onSnapshot(snapshot => {
        this.savedPosts = snapshot.docs.reduce((res, doc) => {
          res[doc.id] = { ...doc.data() }
          return res
        }, {})
        // this.upgradePosts()
        this.updateProgressOnSavedPosts()
      })
    )
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
    createProgrammes () {
      const programmes = {
        'salons': { title: 'Salons', singlePostLabel: 'Salon' },
        'won': { title: 'WON', singlePostLabel: 'World Of Noon' },
        'lab': { title: 'Lab', singlePostLabel: 'Lab' },
        'fieldSchool': { title: 'Field School', singlePostLabel: 'Field School' }
      }
      return Promise.all(Object.entries(programmes).map(([id, pr]) => {
        const { title, singlePostLabel } = pr
        /** @type Programme */
        const programmeData = { title, singlePostLabel, events: [], status: 'public' }
        // !!! DEBUG !!!
        console.log(`%c () %c programmeData: `, 'background:#ffbb00;color:#000', 'color:#00aaff', programmeData)
        return db.collection('programmes').doc(id).set(programmeData)
      }))
    },

    upgradePost (type, post) {
      const updatedPost = { ...post }
      switch (type) {
        case 'salons':
        case 'lab':
          updatedPost.type = 'event'
          updatedPost.partOfProgramme = {
            programmeId: type,
            singlePostLabel: this.programmes[type].singlePostLabel
          }
          break
        case 'programme':
          updatedPost.type = 'event'
          const match = post.title.match(/(.*)#\s?(\d+)/)
          if (match) {
            let programmeId = ''
            switch (match[1].trim()) {
              case 'World of Noon':
                programmeId = 'won'
                break
              case 'Field School':
                programmeId = 'fieldSchool'
                break
              default:
                programmeId = 'salons'
            }
            if (programmeId) {
              updatedPost.partOfProgramme = {
                programmeId,
                singlePostLabel: this.programmes[programmeId].singlePostLabel
              }
            }
            updatedPost.countNumber = match[2]
          }
          break
        case 'diaryPost':
        case 'diary_post':
          updatedPost.type = 'post'
      }
      if (!post.date) {
        updatedPost.date = post.created
      }
      return updatedPost
    },

    async upgradePosts () {
      const snapshot = await db.collection('programmes').get()
      const programmes = snapshot.docs.reduce((res, doc) => {
        res[doc.id] = doc.data()
        return res
      }, {})
      Object.entries(this.savedPosts).forEach(([id, post]) => {
        const toUpdate = {}
        switch (post.type) {
          case 'salons':
          case 'lab':
            toUpdate.type = 'event'
            toUpdate.partOfProgramme = {
              programmeId: post.type,
              singlePostLabel: programmes[post.type].singlePostLabel
            }
            break
          case 'programme':
            toUpdate.type = 'event'
            const match = post.title.match(/(.*)#\s?(\d+)/)
            if (match) {
              let programmeId = ''
              switch (match[1].trim()) {
                case 'World of Noon':
                  programmeId = 'won'
                  break
                case 'Field School':
                  programmeId = 'fieldSchool'
              }
              if (programmeId) {
                toUpdate.partOfProgramme = {
                  programmeId,
                  singlePostLabel: programmes[programmeId].singlePostLabel
                }
              }
              toUpdate.countNumber = match[2]
            }
            break
          case 'diaryPost':
            toUpdate.type = 'post'
        }
        if (!post.date) {
          toUpdate.date = post.created
        }
        if (post.status === 'published') {
          toUpdate.status = 'public'
        }
        // !!! DEBUG !!!
        console.log(`%c (${id} - ${post.type}) %c toUpdate: `, 'background:#ff00aa;color:#000', 'color:#00aaff', toUpdate)
        if (Object.keys(toUpdate).length) {
          db.collection('posts').doc(id).update(toUpdate)
        }
        // Update Programme
        if (toUpdate.partOfProgramme) {
          const { date, endDate, excerpt, thumbnail, countNumber } = post

          /** @type ProgrammePostRef */
          const programmePostRef = { postId: id, title: post.title || '' }
          if (date) programmePostRef.date = date
          if (endDate) programmePostRef.endDate = endDate
          if (excerpt) programmePostRef.excerpt = excerpt
          if (countNumber) programmePostRef.countNumber = countNumber
          if (post.attachments) {
            const attachment = post.attachments[thumbnail || 0]
            if (attachment) {
              programmePostRef.thumbnail = attachment.srcSet
            }
          }
          programmes[toUpdate.partOfProgramme.programmeId].events.push(programmePostRef)
        }
      })
      Object.entries(programmes).forEach(([id, prData]) => {
        // !!! DEBUG !!!
        console.log(`%c () %c prData: `, 'background:#00ffaa;color:#000', 'color:#00aaff', prData)
        const { events } = prData
        db.collection('programmes').doc(id).update({ events })
      })
    },

    getUploadedAttachments () {
      return this.readStorage().then(folders => {
        return folders
          .reduce((res, folder) => {
            res = [...res, ...folder]
            return res
          }, [])
          .reduce((res, item) => {
            if (!res[item.name]) {
              res[item.name] = {}
            }
            res[item.name].srcSet = {}
            const size = item.path.match(/-(full|preview)\.[a-z]{3,4}$/)
            if (size) {
              res[item.name].srcSet[size[1]] = { url: item.url }
            } else {
              res[item.name].srcSet.original = { url: item.url }
            }
            return res
          }, {})
      })
    },

    async getUploadedAttachmentNames () {
      const asc = 1
      return Object.keys(this.uploadedAttachments)
        .reduce((res, item) => {
          if (!res.includes(item)) res.push(item)
          return res
        }, [])
        .sort((a, b) => a > b ? asc : (b > a ? -asc : 0))
    },

    async readStorage (folder) {
      try {
        const rootRef = storage.ref(folder)
        const subFolders = []
        let items = []
        const res = await rootRef.listAll()
        res.prefixes.forEach(folderRef => {
          subFolders.push(Promise.resolve(this.readStorage(folderRef.name)))
        })
        if (subFolders.length) {
          items = await Promise.all(subFolders)
        }
        const files = await Promise.all(res.items.map(itemRef => {
          return itemRef.getDownloadURL().then(url => {
            return {
              path: itemRef.fullPath,
              url,
              name: itemRef.fullPath.split('/').pop().replace(/(-full|-preview)\./, '.')
            }
          })
        }))
        return [...items, ...files]
      } catch (error) {
        console.log(`%c () %c error: `, 'background:#ffbb00;color:#000', 'color:#00aaff', error)
      }
    },

    updateProgressOnSavedPosts () {
      Object.entries(this.convertedPosts).forEach(([type, posts]) => {
        Object.keys(posts).forEach(id => {
          // const unsaved = (this.postsToTransfer[type] || {})[id]
          if (this.savedPosts[`wp${id}`]) {
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

    urlToStorageName (url) {
      const nameWithFolders = url.match(/(\d{4}\/\d{2}\/.*)\..+$/)
      return nameWithFolders ? nameWithFolders[0].replace(/\//g, '-').replace('jpeg', 'jpg') : null
    },

    process () {
      Object.entries(this.convertedPosts).forEach(([type, posts]) => {
        setTimeout(() => {
          Object.keys(posts).forEach(id => this.transferPost(type, id))
        })
      })
      // Object.keys(this.convertedPosts.salons).forEach(id => this.transferPost('salons', id))
    },

    async prepareAttachmentsForUpload (post) {
      const attachments = [
        ...post.attachments.map(a => ({ ...a, placedIn: 'attachments', type: a.mime })),
        ...post.gallery.map(a => ({ ...a, placedIn: 'gallery', type: a.mime }))
      ].map(a => {
        a.storageName = this.urlToStorageName(a.url)
        a.name = a.storageName
        if (this.uploadedAttachmentNames.includes(a.storageName)) {
          a.uploaded = true
          this.uploadedFiles.push({ postId: post.wpID, attachment: a })
        }
        return a
      }).filter(a => !a.uploaded)

      return Promise.all(attachments.map(async a => {
        const file = await imgLib.blobFromUrl(a.url)
        return { ...a, file, id: a.wpID }
      }))
        .then(readyAttachments => {
          return readyAttachments.filter(a => {
            if (!a.file.error) {
              return a
            } else {
              this.errorFiles.push({ postId: post.wpID, attachment: a })
            }
          })
        })
    },

    allUploadedForPost (convertedPost, uploaded) {
      const attachments = [...(convertedPost.attachments || []), ...(convertedPost.gallery || [])]
      return attachments.reduce((attachmentsMap, attachment) => {
        const storageName = attachment.storageName
        const uploadedAttachment = uploaded.find(a => a.id === attachment.wpID)
        if (uploadedAttachment) {
          attachmentsMap[storageName] = { uploadedAttachment, attachment }
        } else if (this.uploadedAttachments.hasOwnProperty(storageName)) {
          attachmentsMap[storageName] = {
            uploadedAttachment: { ...attachment, ...this.uploadedAttachments[storageName] },
            attachment
          }
        }
        return attachmentsMap
      }, {})
    },

    async transferPost (postType, postId) {
      const post = this.convertedPosts[postType][postId]
      if (!post) {
        console.error(`Cant find Post Id: ${postId} of type: ${postType}!`)
        return
      }

      try {
        this.processing = true
        const readyToUpload = await this.prepareAttachmentsForUpload(post)
        this.$set(this.convertedPosts[postType][postId].progress, 'max', readyToUpload.length * 100)
        // !!! DEBUG !!!
        console.log(`%c transferPost() %c readyToUpload: `, 'background:#ff00ff;color:#000', 'color:#00aaff', readyToUpload)
        const uploaded = await upload(post.author.uid, readyToUpload, (id, progress) => {
          this.$set(this.convertedPosts[postType][postId].progress.parts, id, progress)
          const sum = Object.values(post.progress.parts).reduce((r, p) => r + p)
          this.$set(this.convertedPosts[postType][postId].progress, 'total', sum / post.progress.max * 100)
          this.updateTotalProgress()
        })
        const allUploaded = this.allUploadedForPost(post, uploaded)

        const replacements = Object.entries(allUploaded).reduce((replacements, [name, item]) => {
          // !!! DEBUG !!!
          console.log(`%c () %c item: `, 'background:#ffFF00;color:#000', 'color:#00aaff', item)
          if (item.attachment.toReplace) {
            const imgTag = `<img src="${(item.full || item.original || {}).url}">`
            replacements.push({
              toReplace: item.attachment.toReplace,
              replacement: item.attachment.caption
                ? `<span class="img-with-caption">${imgTag}<span class="caption">${item.attachment.caption}</span></span>`
                : imgTag
            })
          }
          return replacements
        }, [])
        let content = post.content
        replacements.forEach(r => {
          content = content.replace(r.toReplace, '')
        })
        const {
          status,
          wpID,
          author,
          created,
          modified,
          excerpt,
          title,
          translations,
          date,
          endDate,
          countNumber,
          location,
          supportedBy,
          website,
          country
        } = post
        let postData = { wpID, author, content, created, modified, status }
        postData.excerpt = excerpt || string.makeExcerpt(content, 30)
        if (title) postData.title = title
        if (translations) postData.translations = translations
        if (date) postData.date = date
        if (endDate) postData.endDate = endDate
        if (countNumber) postData.countNumber = countNumber
        if (location) postData.location = location
        if (supportedBy) postData.supportedBy = supportedBy
        if (website) postData.website = website
        if (country) postData.country = country

        const allUploadedKeys = Object.keys(allUploaded)

        const attachTypes = ['attachments', 'gallery']
        postData.attachments = {}
        attachTypes.forEach(attachType => {
          // !!! DEBUG !!!
          console.log(`%c() %c post: `, 'background:#ffbb00;color:#000', 'color:#00aaff', post)
          if (post[attachType].length) {
            const attachmentsOfType = post[attachType].reduce((res, attachment) => {
              let uploadedAttachment = {}
              let storageKey = allUploadedKeys.find(key => key === attachment.storageName)
              // !!! DEBUG !!!
              console.log(`%c () %c storageKey: `, 'background:#00FF00;color:#000', 'color:#00aaff', storageKey)
              const { mime: type, wpID, url, thumbnail, caption } = attachment
              if (storageKey) {
                uploadedAttachment = allUploaded[storageKey].uploadedAttachment
                // !!! DEBUG !!!
                console.log(`%c () %c attachment: `, 'background:#00FF00;color:#000', 'color:#00aaff', attachment)
                console.log(`%c () %c uploadedAttachment: `, 'background:#00FF00;color:#000', 'color:#00aaff', uploadedAttachment)
                res[storageKey] = { type, wpID, wpUrl: url, wpThumbnail: thumbnail, srcSet: {} }
                if (caption) res[storageKey].caption = caption
                const { srcSet } = uploadedAttachment
                if (srcSet) res[storageKey].srcSet = srcSet
              } else {
                res[wpID] = { type, wpID, wpUrl: url, wpThumbnail: thumbnail }
                if (caption) res[wpID].caption = caption
                this.errorPosts.push(postData)
              }
              return res
            }, {})
            postData.attachments = { ...postData.attachments, ...attachmentsOfType }
          }
        })

        postData.type = string.toCamel(postType)
        postData = this.upgradePost(postType, postData)
        const pId = `wp${wpID}`
        // !!! DEBUG !!!
        console.log(`%c transferPost() %c postData: `, 'background:#ffbb00;color:#000', 'color:#00aaff', postData)
        await db.collection('posts').doc(pId).set(postData)

        this.$set(this.convertedPosts[postType][postId].progress, 'total', 100)

        this.processing = false
      } catch (err) {
        /* DEBUG */
        console.error(`%c transferPost %c, ${postType} ${postId} err: `, 'background:#ff0000;color:#000', 'color:#00aaff', err)
      }
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
        const url = this.getAttachmentUrl(attachment)
        return {
          wpID,
          url,
          thumbnail: attachment ? this.thumbnailUrl(attachment) : null,
          mime: attachment ? attachment.post.post_mime_type : null,
          storageName: this.urlToStorageName(url)
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
      return res.attachments.map(a => ({ ...a, storageName: this.urlToStorageName(a.url) }))
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
  .transfer-wp-posts {
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
      padding: 20px;

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
