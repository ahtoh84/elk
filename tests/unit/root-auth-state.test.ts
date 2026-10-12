import { describe, expect, it } from 'vitest'
import { getRootPageState, shouldUseFullscreenRootEntry, shouldUseFullscreenSignIn } from '~/utils/auth'

describe('root page auth state', () => {
  it('keeps the sign-in form hidden while local accounts are being restored', () => {
    expect(getRootPageState(false, false)).toBe('restoring')
  })

  it('waits for navigation when a restored account is present', () => {
    expect(getRootPageState(true, true)).toBe('redirecting')
  })

  it('shows sign-in only after restoration confirms there is no account', () => {
    expect(getRootPageState(true, false)).toBe('sign-in')
  })
})

describe('fullscreen sign-in layout', () => {
  it('uses the full-screen layout only on the unauthenticated root page after auth restoration', () => {
    expect(shouldUseFullscreenSignIn('/', true, false)).toBe(true)
  })

  it('keeps the application shell while authentication is still restoring', () => {
    expect(shouldUseFullscreenSignIn('/', false, false)).toBe(false)
  })

  it('keeps the application shell for authenticated users and callback routes', () => {
    expect(shouldUseFullscreenSignIn('/', true, true)).toBe(false)
    expect(shouldUseFullscreenSignIn('/signin/callback', true, false)).toBe(false)
  })

  it('does not treat other unauthenticated routes as the sign-in landing page', () => {
    expect(shouldUseFullscreenSignIn('/home', true, false)).toBe(false)
  })
})

describe('fullscreen root entry', () => {
  it('keeps the timeline shell hidden while authentication is being restored', () => {
    expect(shouldUseFullscreenRootEntry('/', false, false)).toBe(true)
  })

  it('keeps the timeline shell hidden until a signed-out state is confirmed', () => {
    expect(shouldUseFullscreenRootEntry('/', false, true)).toBe(true)
    expect(shouldUseFullscreenRootEntry('/', true, false)).toBe(true)
  })

  it('returns to the normal app shell for authenticated users and other routes', () => {
    expect(shouldUseFullscreenRootEntry('/', true, true)).toBe(false)
    expect(shouldUseFullscreenRootEntry('/signin/callback', false, false)).toBe(false)
    expect(shouldUseFullscreenRootEntry('/home', false, false)).toBe(false)
  })
})
