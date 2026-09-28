import { describe, expect, it } from 'vitest'
import { getActiveNavButtonName } from '../../app/composables/nav'

describe('bottom navigation active button', () => {
  it('maps the main navigation routes to their buttons', () => {
    expect(getActiveNavButtonName('/home')).toBe('home')
    expect(getActiveNavButtonName('/qaf.men/public/local')).toBe('local')
    expect(getActiveNavButtonName('/compose')).toBe('compose')
    expect(getActiveNavButtonName('/notifications/mention')).toBe('notification')
  })

  it('keeps local routes from being treated as federated routes', () => {
    expect(getActiveNavButtonName('/qaf.men/public/local')).toBe('local')
    expect(getActiveNavButtonName('/qaf.men/public')).toBe('federated')
  })

  it('does not light a navigation button for unrelated account pages', () => {
    expect(getActiveNavButtonName('/qaf.men/@ahtoh')).toBeUndefined()
  })
})
