export type RootPageState = 'restoring' | 'redirecting' | 'sign-in'

export function getRootPageState(isAuthReady: boolean, hasCurrentUser: boolean): RootPageState {
  if (!isAuthReady)
    return 'restoring'

  return hasCurrentUser ? 'redirecting' : 'sign-in'
}

export function shouldUseFullscreenSignIn(path: string, isAuthReady: boolean, hasCurrentUser: boolean): boolean {
  return path === '/' && isAuthReady && !hasCurrentUser
}

export function shouldUseFullscreenRootEntry(path: string, isAuthReady: boolean, hasCurrentUser: boolean): boolean {
  return path === '/' && (!isAuthReady || !hasCurrentUser)
}
