export const bodyScrollGuard = {
  lastScrollY: 0,
  freezeBodyScroll () {
    if (this.isFrozen()) return
    this.lastScrollY = window.scrollY
    const body = document.body
    body.style.position = 'fixed'
    body.style.top = `-${this.lastScrollY}px`
  },
  releaseBodyScroll () {
    if (!this.isFrozen()) return
    const body = document.body
    body.style.position = ''
    body.style.top = ''
    window.scrollTo(0, this.lastScrollY)
  },
  isFrozen () {
    return document.body.style.position === 'fixed'
  }
}
