import type { NavButtonName } from './settings'

const trailingSlashPattern = /\/$/

function matchesPath(path: string, route: string) {
  return path === route || path.startsWith(`${route}/`)
}

export function getActiveNavButtonName(path: string): NavButtonName | undefined {
  const normalizedPath = path.replace(trailingSlashPattern, '') || '/'

  if (normalizedPath === '/' || normalizedPath === '/home' || normalizedPath.endsWith('/home'))
    return 'home'
  if (matchesPath(normalizedPath, '/search'))
    return 'search'
  if (matchesPath(normalizedPath, '/notifications'))
    return 'notification'
  if (matchesPath(normalizedPath, '/conversations'))
    return 'mention'
  if (matchesPath(normalizedPath, '/favourites'))
    return 'favorite'
  if (matchesPath(normalizedPath, '/bookmarks'))
    return 'bookmark'
  if (matchesPath(normalizedPath, '/compose'))
    return 'compose'
  if (matchesPath(normalizedPath, '/scheduled-posts'))
    return 'scheduledPosts'
  if (normalizedPath.includes('/explore'))
    return 'explore'
  if (normalizedPath.endsWith('/public/local') || normalizedPath.includes('/public/local/'))
    return 'local'
  if (normalizedPath.endsWith('/public') || normalizedPath.includes('/public/'))
    return 'federated'
  if (matchesPath(normalizedPath, '/lists'))
    return 'list'
  if (matchesPath(normalizedPath, '/collections'))
    return 'collection'
  if (matchesPath(normalizedPath, '/hashtags'))
    return 'hashtag'

  return undefined
}
