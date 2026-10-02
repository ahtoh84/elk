export type RootPageState = 'restoring' | 'redirecting' | 'sign-in'

export function getRootPageState(isAuthReady: boolean, hasCurrentUser: boolean): RootPageState {
  if (!isAuthReady)
    return 'restoring'

  return hasCurrentUser ? 'redirecting' : 'sign-in'
}
