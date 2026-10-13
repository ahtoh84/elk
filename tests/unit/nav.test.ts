import { describe, expect, it } from 'vitest'
import { getActiveNavButtonName, isMoreMenuRouteActive } from '../../app/composables/nav'

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

describe('side navigation more button active state', () => {
  it('does not treat the instance local timeline as a more-menu route', () => {
    expect(isMoreMenuRouteActive('/qaf.men/public/local', 'qaf.men')).toBe(false)
    expect(isMoreMenuRouteActive('/public/local')).toBe(false)
  })

  it('keeps the federated timeline active under the more menu', () => {
    expect(isMoreMenuRouteActive('/qaf.men/public', 'qaf.men')).toBe(true)
    expect(isMoreMenuRouteActive('/public')).toBe(true)
  })

  it('keeps nested pages of more-menu routes active', () => {
    expect(isMoreMenuRouteActive('/settings/preferences')).toBe(true)
    expect(isMoreMenuRouteActive('/qaf.men/collections/featured', 'qaf.men')).toBe(true)
  })
})
