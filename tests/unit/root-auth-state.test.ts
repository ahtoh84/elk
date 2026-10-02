import { describe, expect, it } from 'vitest'
import { getRootPageState } from '~/utils/auth'

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
