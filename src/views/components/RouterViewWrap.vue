<template>
  <router-view :name="name"/>
</template>

<script>
import { setRootPath } from '../../lib/bookmarks'

export default {
  // based on https://codepen.io/ksurakka/pen/RwwKyPy
  name: 'RouterViewWrap',
  props: {
    name: { default: 'default' }
  },

  data: () => ({
    // "routeMatches" attribute contains true if the last call to $createElement
    // returned a new component. In general true means that the current
    // route generates a request to show some component in the wrapped
    // router view.
    routeMatches: false
  }),
  created () {
    // Wrap $createElement function
    const origCreateElementFunc = this.$createElement

    // "lastComponent" variable contains the last component created
    // by $createElement function. In certain cases this
    // stored component is returned instead of a new component.
    let lastComponent

    this.$createElement = (componentType, data) => {
      if (componentType && (!data || !data.routerView)) {
        // Seems that it is someone else (than Vue-router) calling
        // the  "$createElement", use original function as is.
        return origCreateElementFunc(componentType, data)
      }

      if (componentType) {
        setRootPath(this.$route.fullPath)
      }

      // Find a parent router wrapper
      let parentRouterViewWrap = this.$parent
      while (parentRouterViewWrap) {
        if ((((parentRouterViewWrap || {}).constructor || {}).options || {}).name === 'RouterViewWrap') {
          break
        }
        parentRouterViewWrap = parentRouterViewWrap.$parent
      }
      const parentRouteMatch = parentRouterViewWrap && parentRouterViewWrap.routeMatches
      if (componentType && (!parentRouterViewWrap || parentRouteMatch)) {
        // A specific component is requested and the parent router wrapped
        // does not exists or has a match.

        // Mark that currently this router wrapper has
        // a matching route, child router wrappers may check this
        // information to decide what to show.
        this.routeMatches = true
      } else {
        // An empty component is requested.

        // Mark that currently this router wrapper does not have
        // a matching route, child router wrappers may check this
        // information to decide what to show.
        this.routeMatches = false

        // If the parent route wrapper does not have a match,
        // return previously created component.
        if (!parentRouteMatch) {
          return lastComponent
        }
        // else
        // The parent router view has a match but empty view
        // is requested for this child router view. Let's assume
        // that this request is OK, continue and create and return
        // an empty component.
      }

      lastComponent = origCreateElementFunc(componentType, data)
      return lastComponent
    }
  }
}
</script>
