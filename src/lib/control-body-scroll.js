export const bodyScrollGuard = {
  scrollY: 0,
  lastScrollY: 0,
  freezeBodyScroll () {
    this.lastScrollY = this.scrollY
    const body = document.body
    body.style.position = 'fixed'
    body.style.top = `-${this.lastScrollY}px`
  },
  releaseBodyScroll () {
    const body = document.body
    body.style.position = ''
    body.style.top = ''
    window.scrollTo(0, this.lastScrollY)
  },
  init () {
    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY
    })
  }
}
