import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server)
    return

  if (to.path === '/signin/callback')
    return

  if (isHydrated.value)
    return handleAuth(to)

  onHydrated(() => handleAuth(to))
})

function handleAuth(to: RouteLocationNormalized) {
  if (to.path === '/') {
    if (!currentUser.value)
      return

    // Installed PWA shortcut to notifications
    if (to.query['notifications-pwa-shortcut'] !== undefined) {
      if (currentUser.value)
        return navigateTo('/notifications')
    }

    // Installed PWA shortcut to local
    if (to.query['local-pwa-shortcut'] !== undefined)
      return navigateTo(`/${currentServer.value}/public/local`)
  }

  if (!currentUser.value) {
    if (to.path === '/home' && to.query['share-target'] !== undefined)
      return navigateTo('/share-target')
    else
      return navigateTo('/')
  }

  if (to.path === '/')
    return navigateTo('/home')
}
