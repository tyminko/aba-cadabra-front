<template>
  <div ref="root" class="img-n-o-wrap" :title="alt" :style="styleRootWidthHeight">
    <img ref="img"
        :src="src"
        :srcset="srcset"
        :sizes="sizes"
        :alt="alt"
        :crossorigin="crossorigin"
        :decoding="decoding"
        :style="styleImg"
        @load="onLoad">
    <div ref="overlay" class="__img-n-o img-n-o-container">
      <slot />
    </div>
  </div>
</template>

<script>
import simpleID from '../../../lib/simpleId'
export default {
  name: 'ImgTransOverlay',
  props: {
    src: { type: String, default: '' },
    srcset: { type: String, default: null },
    sizes: { type: String, default: null },
    alt: { type: String, default: '' },
    height: { type: [String, Number], default: null },
    width: { type: [String, Number], default: null },
    crossorigin: { type: String, default: null, validator: v => !v || v === 'anonymous' || v === 'use-credentials' },
    decoding: { type: String, default: null, validator: v => !v || v === 'sync' || v === 'async' || v === 'auto' },

    objectFit: { type: String, default: 'contain' },
    objectPosition: { type: String, default: 'center' },

    oBlur: { type: [String, Number], default: 10 },
    oDark: Boolean,

    oBrightness: { type: [String, Number], default: null },
    oContrast: { type: [String, Number], default: null },
    oGrayscale: { type: [String, Number], default: null },
    oHueRotate: { type: [String, Number], default: null },
    oInvert: { type: [String, Number], default: null },
    oSaturate: { type: [String, Number], default: null },
    oSepia: { type: [String, Number], default: null },
    oOpacity: { type: [String, Number], default: null },

    oFillOpacity: { type: [String, Number], default: 0.5 },
    oFillColor: { type: String, default: '#fff' },
    oTextColor: { type: String, default: null },
    oSoftEdges: Boolean,

    updateOnWinResize: { type: Boolean, default: true }
  },

  data: () => ({
    img: null,
    /** @type CSSStyleDeclaration */
    imgCSS: null,
    imgCleanRect: null,
    observers: {},
    blurScaleFact: 0.004
  }),

  watch: {
    src () { this.$nextTick(this.update) },
    oBlur () { this.updateFillters(true) },
    oTextColor () { this.updateTextColor() },
    oFillColor () { this.updateFillColor() },
    oFillOpacity () { this.updateFillOpacity() },
    oBrightness () { this.updateFillters() },
    oContrast () { this.updateFillters() },
    oGrayscale () { this.updateFillters() },
    oHueRotate () { this.updateFillters() },
    oInvert () { this.updateFillters() },
    oSaturate () { this.updateFillters() },
    oSepia () { this.updateFillters() },
    oOpacity () { this.updateFillters() },
    oSoftEdges () { this.update() },
    objectFit () { this.updateImgStyle('objectFit') },
    objectPosition () { this.updateImgStyle('objectPosition') }
  },

  computed: {
    filteStr () {
      let filter = this.oBlur !== null ? ` blur(${this.oBlur}px)` : ''
      filter += this.oBrightness !== null ? ` brightness(${this.oBrightness}%)` : ''
      filter += this.oContrast !== null ? ` contrast(${this.oContrast}%)` : ''
      filter += this.oGrayscale !== null ? ` grayscale(${this.oGrayscale}%)` : ''
      filter += this.oHueRotate !== null ? ` hue-rotate(${this.oHueRotate}deg)` : ''
      filter += this.oInvert !== null ? ` invert(${this.oInvert}%)` : ''
      filter += this.oSaturate !== null ? ` saturate(${this.oSaturate}%)` : ''
      filter += this.oSepia !== null ? ` sepia(${this.oSepia}%)` : ''
      filter += this.oOpacity !== null ? ` opacity(${this.oOpacity}%)` : ''
      return filter
    },
    blurWidthFactor () { return this.oSoftEdges ? 1 : 2 },
    styleBgElSizeStr () { return `calc(100% + ${this.oBlur * this.blurWidthFactor * 2}px)` },
    styleBgElPlacementStr () { return `-${this.oBlur * this.blurWidthFactor}px` },
    styleRootWidthHeight () {
      return {
        width: Number.isInteger(this.width) || `${parseInt(this.width)}` === this.width ? `${this.width}px` : this.width,
        height: Number.isInteger(this.height) || `${parseInt(this.height)}` === this.height ? `${this.height}px` : this.height
      }
    },
    styleImg () {
      return { objectFit: this.objectFit, objectPosition: this.objectPosition }
    }
  },

  mounted () {
    this.img = this.$refs['img']
    // this.img.addEventListener('load', () => {
    //   this.imgCSS = window.getComputedStyle(this.img)
    //   // this.update()
    // })
    if (this.updateOnWinResize) {
      window.addEventListener('resize', (e) => {
        this.checkForRootRectChage()
      })
    }
    this.addRootObserver()
  },

  methods: {
    onLoad (event) {
      if (this.img) {
        this.imgCSS = window.getComputedStyle(this.img)
        this.update()
      }
      const { target } = event
      this.$emit('load', { target })
    },

    update () {
      this.forEachOverlayElement((/** @type HTMLElement */ el, i) => {
        if (!el.dataset.ioElKey) {
          el.dataset.ioElKey = simpleID()
          this.setupOverlayEl(el)
          this.addOverlayElementObserver(el)
        }
        if (!el.style.zIndex) el.style.zIndex = 0
        const scrollable = el.classList.contains('io-scrollable')
        el.style.overflow = this.oSoftEdges && !scrollable
          ? 'visible'
          : (scrollable ? 'auto' : 'hidden')
        this.updateOverlayEl(el)
      })
    },

    /**
     * @param {HTMLElement} overlayEl
     */
    updateOverlayEl (overlayEl) {
      const key = overlayEl.dataset.ioElKey
      if (!key) return
      const bgImg = overlayEl.querySelector(':scope > [data-io-bg-el] > img')
      if (!bgImg) return

      const updateBgImageStyleAndPlacement = () => {
        this.updateBgImageStyles(bgImg)
        this.updateBgImagePlacement(bgImg)
      }

      bgImg.addEventListener('load', updateBgImageStyleAndPlacement)
      // !!! DEBUG !!!
      console.log(`%c updateOverlayEl() %c bgImg.src: `, 'background:#ffbbaa;color:#000', 'color:#00aaff', bgImg.src)
      console.log(`%c updateOverlayEl() %c this.img.src: `, 'background:#ffbbaa;color:#000', 'color:#00aaff', this.img.src)
      if (bgImg.src !== this.img.src) {
        bgImg.src = this.img.src
      } else {
        updateBgImageStyleAndPlacement()
      }
      if (this.oTextColor !== null) overlayEl.style.color = this.oTextColor
    },

    /**
     * @param {HTMLElement} bgImg
     */
    updateBgImagePlacement (bgImg) {
      const left = bgImg.parentElement.offsetLeft + bgImg.parentElement.parentElement.offsetLeft
      const top = bgImg.parentElement.offsetTop + bgImg.parentElement.parentElement.offsetTop
      const right = parseInt(this.imgCSS.width) - (bgImg.parentElement.offsetWidth + left)
      const bottom = parseInt(this.imgCSS.height) - (bgImg.parentElement.offsetHeight + top)
      const s = bgImg.style

      s.left = `${-left}px`
      s.top = `${-top}px`

      if (left < this.oBlur || top < this.oBlur || right < this.oBlur || bottom < this.oBlur) {
        s.transform = `${this.imgCSS.transform !== 'none' ? this.imgCSS.transform : ''} scale(${1 + this.oBlur * this.blurScaleFact})`
      } else if (s.transform !== this.imgCSS.transform) {
        s.transform = this.imgCSS.transform
      }
    },

    /**
     * @param {HTMLElement} bgImg
     */
    updateBgImageStyles (bgImg) {
      const key = bgImg.dataset.ioElKey
      if (!key || !this.observers.hasOwnProperty(key)) return
      if (!this.observers[key].bgImgCSS) {
        this.observers[key].bgImgCSS = window.getComputedStyle(bgImg)
      }
      const bgImgCSS = this.observers[key].bgImgCSS
      const excepts = [
        'display',
        'position',
        'left',
        'top',
        'right',
        'bottom',
        'transform',
        'min-width',
        'min-height',
        'max-width',
        'max-height',
        'opacity']

      Array.from(this.imgCSS).forEach(rule => {
        if (excepts.indexOf(rule) > -1) return
        if (bgImgCSS[rule] !== this.imgCSS[rule]) bgImg.style[rule] = this.imgCSS[rule]
      })

      if (this.oFillOpacity !== null && bgImg.style.opacity !== 1 - this.oFillOpacity) {
        bgImg.style.opacity = 1 - this.oFillOpacity
      }
    },

    updateBgImageDimension (bgImg) {
      if (bgImg.style.width !== this.imgCSS.width) bgImg.style.width = this.imgCSS.width
      if (bgImg.style.height !== this.imgCSS.height) bgImg.style.height = this.imgCSS.height
    },

    /**
     * @param {HTMLElement} bgImg
     */
    updateBgImageAppearance (bgImg) {
      const { objectFit, objectPosition, width, height } = window.getComputedStyle(this.img)
      const s = bgImg.style
      if (s.objectFit !== objectFit) s.objectFit = objectFit
      if (s.objectPosition !== objectPosition) s.objectPosition = objectPosition
      if (s.width !== width) s.width = width
      if (s.height !== height) s.height = height
    },

    updateImgStyle (style) {
      this.forEachBgImg(bgImg => {
        bgImg.style[style] = this[style] ? this[style] : this.img.style[style]
      })
    },

    updateFillters (isBlur) {
      this.forEachBgEl(el => {
        el.style.filter = this.filteStr
        if (isBlur) {
          const bgImg = el.querySelector(':scope > img')
          if (!bgImg) return
          el.style.top = this.styleBgElPlacementStr
          el.style.left = this.styleBgElPlacementStr
          el.style.width = this.styleBgElSizeStr
          el.style.height = this.styleBgElSizeStr
          this.updateBgImagePlacement(bgImg)
        }
      })
    },

    updateFillOpacity () {
      this.forEachBgImg(bgImg => {
        bgImg.style.opacity = 1 - this.oFillOpacity
      })
    },

    updateFillColor () {
      this.forEachBgEl(el => { el.style.background = this.oFillColor })
    },

    updateTextColor () {
      this.forEachOverlayElement(el => { el.style.color = this.oTextColor })
    },

    /**
     * @param {HTMLElement} overlayEl
     */
    setupOverlayEl (overlayEl) {
      let key = overlayEl.dataset.ioElKey
      if (!key) {
        key = overlayEl.dataset.ioElKey = simpleID()
      }
      let bgEl, bgImg
      bgEl = overlayEl.querySelector(':scope > [data-io-bg-el]')
      if (!bgEl) {
        bgEl = this.setupBgEl(overlayEl)
        bgImg = this.setupBgImg(key)
        bgEl.appendChild(bgImg)
        overlayEl.prepend(bgEl)
      } else {
        bgImg = bgEl.querySelector(':scope > img')
        if (!bgImg) {
          bgImg = this.setupBgImg(key)
          bgEl.appendChild(bgImg)
        }
      }
    },

    /**
     * @param {HTMLElement} overlayEl
     * @return {HTMLElement}
     */
    setupBgEl (overlayEl) {
      const bgEl = document.createElement('span')
      bgEl.dataset.ioBgEl = true
      bgEl.classList.add('io-bg')

      const style = bgEl.style
      style.display = `block`
      style.position = `absolute`
      style.top = this.styleBgElPlacementStr
      style.left = this.styleBgElPlacementStr
      style.width = this.styleBgElSizeStr
      style.height = this.styleBgElSizeStr
      style.borderRadius = `${window.getComputedStyle(overlayEl).borderRadius}`
      style.overflow = 'hidden'
      style.zIndex = `-1`

      style.background = this.oFillColor

      if (this.oSoftEdges) style.overflow = 'hidden'

      style.filter = this.filteStr

      return bgEl
    },

    /**
     * @return {HTMLElement}
     */
    setupBgImg (key) {
      const bgImg = this.img.cloneNode()
      bgImg.dataset.ioElKey = key
      bgImg.style.position = 'absolute'
      bgImg.style.minWidth = `0`
      bgImg.style.minHeight = '0'
      bgImg.style.maxWidth = `unset`
      bgImg.style.maxHeight = 'unset'
      return bgImg
    },

    /**
     * @param {HTMLElement} overlayEl
     */
    addOverlayElementObserver (overlayEl) {
      let key = overlayEl.dataset.ioElKey
      if (!key) key = overlayEl.dataset.ioElKey = simpleID()

      const config = {
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        childList: true,
        subtree: true
      }
      this.observers[key] = {
        observer: new MutationObserver(mutations => {
          let nonBgMutation = mutations.filter(m => {
            return !m.target.hasOwnProperty('dataset') ||
              (!m.target.dataset.hasOwnProperty('ioElKey') &&
               !m.target.dataset.hasOwnProperty('ioBgEl'))
          })
          if (!nonBgMutation.length) return
          const observer = this.observers[key]
          const now = Date.now()
          if (now - observer.lastMutation > 16) { // don't react on mutations that could happen quicker then 60fps
            observer.lastMutation = now
            clearTimeout(observer.checkTimeout)
            observer.checkCount = 0
            this.checkForOverlayRectChage(overlayEl)
          }
        }),
        lastMutation: null,
        lastRect: { left: null, top: null, right: null, bottom: null },
        bgImgCSS: null,
        checkTimeout: null,
        checkCount: 0
      }
      this.observers[key].observer.observe(overlayEl, config)
    },

    addRootObserver () {
      if (!this.$refs.root) return
      const config = {
        attributes: true,
        attributeOldValue: true
      }
      this.observers.root = {
        observer: new MutationObserver(mutations => {
          const observer = this.observers.root
          const now = Date.now()
          if (now - observer.lastMutation > 16) { // don't react on mutations that could happen quicker then 60fps
            observer.lastMutation = now
            clearTimeout(observer.checkTimeout)
            observer.checkCount = 0
            this.checkForRootRectChage()
          }
        }),
        lastMutation: null,
        lastRect: { left: null, top: null, right: null, bottom: null },
        checkTimeout: null,
        checkCount: 0
      }
      this.observers.root.observer.observe(this.$refs.root, config)
    },

    checkForRootRectChage () {
      if (!this.$refs.root) return
      this.keepLookingForChange(this.$refs.root, this.observers.root, this.dimensionsChanged, rootEl => {
        this.forEachBgImg(bgImg => {
          this.updateBgImageDimension(bgImg)
          this.updateBgImagePlacement(bgImg)
        })
      })
    },

    checkForOverlayRectChage (el) {
      const key = el.dataset.ioElKey
      if (!key) return
      const observer = this.observers[key]
      this.keepLookingForChange(el, observer, this.rectChanged, this.updateOverlayEl)
    },

    keepLookingForChange (el, observer, checkFunc, callback) {
      if (checkFunc(el, observer)) {
        if (typeof callback === 'function') callback(el)
        observer.checkCount = 0
        clearTimeout(observer.checkTimeout)
      } else {
        observer.checkCount += 1
      }
      if (observer.checkCount < 10) {
        observer.checkTimeout = setTimeout(requestAnimationFrame(() => {
          this.keepLookingForChange(el, observer, checkFunc, callback)
        }), (observer.checkCount + 1) * 20) // slowdown checking for a change. the last (10th) check will be in 1100ms after the first one
      }
    },

    rectChanged (el, observer) {
      let { left, top, width, height } = el.getBoundingClientRect()
      left += pageXOffset
      top += pageYOffset
      const lastRect = observer.lastRect
      const changes = []
      if (lastRect.left !== left) changes.push('left')
      if (lastRect.top !== top) changes.push('top')
      if (lastRect.width !== width) changes.push('width')
      if (lastRect.height !== height) changes.push('height')
      if (changes.length) {
        observer.lastRect = { left, top, width, height }
        return changes
      }
      return false
    },

    dimensionsChanged (el, observer) {
      const changes = this.rectChanged(el, observer)
      return changes && (changes.includes('width') || changes.includes('height'))
    },

    forEachOverlayElement (callback) {
      const overlay = this.$refs['overlay']
      if (!overlay) return
      overlay.querySelectorAll(':scope > *').forEach(el => {
        if (typeof callback === 'function') callback(el)
      })
    },

    forEachBgEl (callback) {
      this.forEachOverlayElement(el => {
        const bgEl = el.querySelector(':scope > [data-io-bg-el]')
        if (!bgEl) return
        if (typeof callback === 'function') callback(bgEl)
      })
    },

    forEachBgImg (callback) {
      this.forEachOverlayElement(el => {
        const bgImg = el.querySelector(':scope > [data-io-bg-el] > img')
        if (!bgImg) return
        if (typeof callback === 'function') callback(bgImg)
      })
    }
  }
}
</script>

<style lang='scss'>
.img-n-o-wrap {
  /*display: inline-block;*/
  position: relative;
  overflow: hidden;
  img {
    display: block;
    width: 100%;
    height: 100%;
  }
  .__img-n-o {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    display: flex;
    align-items: center;
    justify-content: center;

    & > * {
      position: relative;
    }
  }
}
</style>
