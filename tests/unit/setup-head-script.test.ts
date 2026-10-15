import vm from 'node:vm'
import { describe, expect, it } from 'vitest'
import { STORAGE_KEY_CURRENT_USER_HANDLE, STORAGE_KEY_SETTINGS } from '../../app/constants'
import { generateHeadScript } from '../../app/plugins/setup-head-script.server'

describe('setup-head-script.server', () => {
  function createMockEnvironment(options: {
    cookie?: string
    localStorageData?: Record<string, string>
    throwOnLocalStorage?: boolean
    matchMediaDark?: boolean
  } = {}) {
    const classList = new Set<string>()
    const styleProps: Record<string, string> = {}
    const attributes: Record<string, string> = {}

    const store: Record<string, string> = { ...options.localStorageData }

    const mockLocalStorage = {
      getItem(key: string) {
        if (options.throwOnLocalStorage)
          throw new Error('SecurityError: The operation is insecure.')
        return store[key] ?? null
      },
      setItem(key: string, val: string) {
        if (options.throwOnLocalStorage)
          throw new Error('SecurityError: The operation is insecure.')
        store[key] = val
      },
    }

    const mockDocument = {
      cookie: options.cookie ?? '',
      documentElement: {
        classList: {
          contains: (cls: string) => classList.has(cls),
          add: (cls: string) => classList.add(cls),
          remove: (cls: string) => classList.delete(cls),
        },
        style: {
          setProperty: (prop: string, val: string) => {
            styleProps[prop] = val
          },
          getPropertyValue: (prop: string) => styleProps[prop] ?? '',
        },
        setAttribute: (attr: string, val: string) => {
          attributes[attr] = val
        },
      },
    }

    const mockWindow = {
      matchMedia: (query: string) => ({
        matches: query.includes('dark') ? Boolean(options.matchMediaDark) : false,
      }),
    }

    return {
      sandbox: {
        document: mockDocument,
        window: mockWindow,
        localStorage: mockLocalStorage,
      },
      classList,
      styleProps,
      attributes,
    }
  }

  it('generates valid JavaScript syntax that evaluates cleanly without syntax error', () => {
    const script = generateHeadScript()
    const { sandbox } = createMockEnvironment()

    expect(() => {
      vm.runInNewContext(script, sandbox)
    }).not.toThrow()
  })

  it('adds dark class when nuxt-color-mode is dark in cookie', () => {
    const script = generateHeadScript()
    const { sandbox, classList } = createMockEnvironment({
      cookie: 'nuxt-color-mode=dark',
    })

    vm.runInNewContext(script, sandbox)
    expect(classList.has('dark')).toBe(true)
  })

  it('adds dark class when localStorage nuxt-color-mode is dark and syncs to cookie', () => {
    const script = generateHeadScript()
    const { sandbox, classList } = createMockEnvironment({
      localStorageData: {
        'nuxt-color-mode': 'dark',
      },
    })

    vm.runInNewContext(script, sandbox)
    expect(classList.has('dark')).toBe(true)
    expect(sandbox.document.cookie).toContain('nuxt-color-mode=dark')
  })

  it('applies zen mode class and custom font size from user settings', () => {
    const script = generateHeadScript()
    const { sandbox, classList, styleProps } = createMockEnvironment({
      localStorageData: {
        [STORAGE_KEY_CURRENT_USER_HANDLE]: 'alice@elk.zone',
        [STORAGE_KEY_SETTINGS]: JSON.stringify({
          'alice@elk.zone': {
            fontSize: 'md',
            preferences: { zenMode: true },
          },
        }),
      },
    })

    vm.runInNewContext(script, sandbox)
    expect(classList.has('zen')).toBe(true)
    expect(styleProps['--font-size']).toBe('15px')
  })

  it('applies custom theme colors and handles ink theme contrast correctly', () => {
    const script = generateHeadScript()
    const { sandbox, styleProps } = createMockEnvironment({
      cookie: 'nuxt-color-mode=light',
      localStorageData: {
        [STORAGE_KEY_CURRENT_USER_HANDLE]: 'alice@elk.zone',
        [STORAGE_KEY_SETTINGS]: JSON.stringify({
          'alice@elk.zone': {
            themeSettingsVersion: 1,
            themeColors: {
              '--theme-color-name': '#242424',
              '--c-primary': '#111111',
            },
          },
        }),
      },
    })

    vm.runInNewContext(script, sandbox)
    expect(styleProps['--c-primary']).toBe('#111111')
    expect(styleProps['--c-nav-active-bg']).toBe('#f0f0f0')
    expect(styleProps['--c-container-border']).toBe('#D5D5D5')
  })

  it('gracefully handles corrupted JSON in localStorage without throwing', () => {
    const script = generateHeadScript()
    const { sandbox } = createMockEnvironment({
      localStorageData: {
        [STORAGE_KEY_SETTINGS]: 'not-valid-json{{{',
      },
    })

    expect(() => {
      vm.runInNewContext(script, sandbox)
    }).not.toThrow()
  })

  it('gracefully handles security exceptions when localStorage is restricted', () => {
    const script = generateHeadScript()
    const { sandbox } = createMockEnvironment({
      throwOnLocalStorage: true,
    })

    expect(() => {
      vm.runInNewContext(script, sandbox)
    }).not.toThrow()
  })
})
