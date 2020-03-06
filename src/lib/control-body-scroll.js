export const bodyScrollGuard = {
  lastScrollY: 0,
  freezeBodyScroll () {
    this.lastScrollY = window.scrollY
    const body = document.body
    body.style.position = 'fixed'
    body.style.top = `-${this.lastScrollY}px`
  },
  releaseBodyScroll () {
    const body = document.body
    body.style.position = ''
    body.style.top = ''
    window.scrollTo(0, this.lastScrollY)
  }
}
