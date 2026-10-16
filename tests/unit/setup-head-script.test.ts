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
            themeSettingsVersion: 2,
            themeColors: {
              '--theme-color-name': '#242424',
              '--c-primary': '#111111',
            },
          },
        }),
      },
    })

    vm.runInNewContext(script, sandbox)
    expect(styleProps['--c-primary']).toBe('color-mix(in srgb, #111111, black 25%)')
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

  it('does NOT add dark class when cookie is nuxt-color-mode=light even if system prefers dark', () => {
    const script = generateHeadScript()
    const { sandbox, classList } = createMockEnvironment({
      cookie: 'nuxt-color-mode=light',
      matchMediaDark: true,
    })

    vm.runInNewContext(script, sandbox)
    expect(classList.has('dark')).toBe(false)
  })

  it('respects system preference when color mode is system', () => {
    const script = generateHeadScript()

    const darkEnv = createMockEnvironment({
      cookie: 'nuxt-color-mode=system',
      matchMediaDark: true,
    })
    vm.runInNewContext(script, darkEnv.sandbox)
    expect(darkEnv.classList.has('dark')).toBe(true)

    const lightEnv = createMockEnvironment({
      cookie: 'nuxt-color-mode=system',
      matchMediaDark: false,
    })
    vm.runInNewContext(script, lightEnv.sandbox)
    expect(lightEnv.classList.has('dark')).toBe(false)
  })

  it('correctly resolves non-ink theme colors in dark mode', () => {
    const script = generateHeadScript()
    const { sandbox, styleProps } = createMockEnvironment({
      cookie: 'nuxt-color-mode=dark',
      localStorageData: {
        [STORAGE_KEY_CURRENT_USER_HANDLE]: 'alice@elk.zone',
        [STORAGE_KEY_SETTINGS]: JSON.stringify({
          'alice@elk.zone': {
            themeSettingsVersion: 1,
            themeColors: {
              '--theme-color-name': '#b8956a',
              '--rgb-primary': '184, 149, 106',
              '--rgb-dark-primary': '212, 165, 116',
              '--c-bg-base': '#faf8f5',
              '--c-dark-bg-base': '#1c1915',
              '--c-text-base': '#3d3426',
              '--c-dark-text-base': '#f5ede3',
              '--c-primary': 'rgb(var(--rgb-primary))',
              '--c-dark-primary': 'rgb(var(--rgb-dark-primary))',
              '--c-nav-active-bg': '#b8956a1f',
              '--c-dark-nav-active-bg': '#d4a5741f',
              '--c-container-border': 'rgba(61, 52, 38, 0.07)',
              '--c-dark-container-border': 'rgba(245, 237, 227, 0.12)',
            },
          },
        }),
      },
    })

    vm.runInNewContext(script, sandbox)
    expect(styleProps['--c-bg-base']).toBe('#1c1915')
    expect(styleProps['--c-text-base']).toBe('#f5ede3')
    expect(styleProps['--c-primary']).toBe('rgb(var(--rgb-dark-primary))')
    expect(styleProps['--c-nav-active-bg']).toBe('#d4a5741f')
    expect(styleProps['--c-container-border']).toBe('rgba(245, 237, 227, 0.12)')
  })

  it('correctly resolves non-ink theme colors in light mode', () => {
    const script = generateHeadScript()
    const { sandbox, styleProps } = createMockEnvironment({
      cookie: 'nuxt-color-mode=light',
      localStorageData: {
        [STORAGE_KEY_CURRENT_USER_HANDLE]: 'elkdev@universeodon.com',
        [STORAGE_KEY_SETTINGS]: JSON.stringify({
          'elkdev@universeodon.com': {
            themeSettingsVersion: 2,
            themeColors: {
              '--theme-color-name': '#b8956a',
              '--rgb-primary': '184, 149, 106',
              '--rgb-dark-primary': '212, 165, 116',
              '--c-bg-base': '#faf8f5',
              '--c-dark-bg-base': '#1c1915',
              '--c-text-base': '#3d3426',
              '--c-dark-text-base': '#f5ede3',
              '--c-primary': 'rgb(var(--rgb-primary))',
              '--c-dark-primary': 'rgb(var(--rgb-dark-primary))',
              '--c-nav-active-bg': '#b8956a1f',
              '--c-dark-nav-active-bg': '#d4a5741f',
              '--c-container-border': 'rgba(61, 52, 38, 0.07)',
              '--c-dark-container-border': 'rgba(245, 237, 227, 0.12)',
            },
          },
        }),
      },
    })

    vm.runInNewContext(script, sandbox)
    expect(styleProps['--c-bg-base']).toBe('#faf8f5')
    expect(styleProps['--c-text-base']).toBe('#3d3426')
    expect(styleProps['--c-primary']).toBe('color-mix(in srgb, rgb(var(--rgb-primary)), black 25%)')
    expect(styleProps['--c-nav-active-bg']).toBe('#b8956a1f')
    expect(styleProps['--c-container-border']).toBe('rgba(61, 52, 38, 0.07)')
  })

  it('strictly isolates account settings and prevents cross-account or anonymous leakage', () => {
    const script = generateHeadScript()

    // Scenario 1: Alice is logged in, but only Bob has custom settings
    const aliceEnv = createMockEnvironment({
      localStorageData: {
        [STORAGE_KEY_CURRENT_USER_HANDLE]: 'alice@elk.zone',
        [STORAGE_KEY_SETTINGS]: JSON.stringify({
          'bob@elk.zone': {
            fontSize: 'xl',
            preferences: { zenMode: true },
            themeColors: {
              '--theme-color-name': '#b8956a',
              '--c-bg-base': '#faf8f5',
            },
          },
        }),
      },
    })
    vm.runInNewContext(script, aliceEnv.sandbox)
    expect(aliceEnv.classList.has('zen')).toBe(false)
    expect(aliceEnv.styleProps['--font-size']).toBeUndefined()
    expect(aliceEnv.styleProps['--c-bg-base']).toBeUndefined()

    // Scenario 2: Visitor is unauthenticated ([anonymous]), Bob has custom settings
    const anonEnv = createMockEnvironment({
      localStorageData: {
        [STORAGE_KEY_CURRENT_USER_HANDLE]: '',
        [STORAGE_KEY_SETTINGS]: JSON.stringify({
          'bob@elk.zone': {
            fontSize: 'xl',
            preferences: { zenMode: true },
            themeColors: {
              '--theme-color-name': '#b8956a',
              '--c-bg-base': '#faf8f5',
            },
          },
        }),
      },
    })
    vm.runInNewContext(script, anonEnv.sandbox)
    expect(anonEnv.classList.has('zen')).toBe(false)
    expect(anonEnv.styleProps['--font-size']).toBeUndefined()
    expect(anonEnv.styleProps['--c-bg-base']).toBeUndefined()
  })

  it('recovers canonical theme values and prevents dark flash when legacy theme with dark-resolved values is loaded in light mode', () => {
    const script = generateHeadScript()
    const { sandbox, styleProps } = createMockEnvironment({
      cookie: 'nuxt-color-mode=light',
      localStorageData: {
        [STORAGE_KEY_CURRENT_USER_HANDLE]: 'alice@elk.zone',
        [STORAGE_KEY_SETTINGS]: JSON.stringify({
          'alice@elk.zone': {
            themeSettingsVersion: 1,
            // Legacy corrupted theme: all 62 keys present, but light values were overwritten by dark values
            themeColors: {
              '--theme-color-name': '#b8956a',
              '--rgb-primary': '184, 149, 106',
              '--rgb-dark-primary': '212, 165, 116',
              '--c-bg-base': '#1c1915', // corrupted dark base
              '--c-dark-bg-base': '#1c1915',
              '--c-text-base': '#f5ede3', // corrupted dark text
              '--c-dark-text-base': '#f5ede3',
              '--c-primary': 'rgb(var(--rgb-dark-primary))',
              '--c-dark-primary': 'rgb(var(--rgb-dark-primary))',
            },
          },
        }),
      },
    })

    vm.runInNewContext(script, sandbox)
    // Head script should identify the old version (< 2) and substitute canonical palette
    expect(styleProps['--c-bg-base']).toBe('#faf8f5')
    expect(styleProps['--c-text-base']).toBe('#3d3426')
    expect(styleProps['--c-primary']).toBe('color-mix(in srgb, rgb(var(--rgb-primary)), black 25%)')
  })

  it('recovers canonical theme values for unversioned non-default theme with dark-resolved values in light mode', () => {
    const script = generateHeadScript()
    const { sandbox, styleProps } = createMockEnvironment({
      cookie: 'nuxt-color-mode=light',
      localStorageData: {
        [STORAGE_KEY_CURRENT_USER_HANDLE]: 'alice@elk.zone',
        [STORAGE_KEY_SETTINGS]: JSON.stringify({
          'alice@elk.zone': {
            // themeSettingsVersion is undefined
            themeColors: {
              '--theme-color-name': '#8a70c0', // Dusk
              '--c-bg-base': '#16131c', // dark base
              '--c-dark-bg-base': '#16131c',
              '--c-text-base': '#ede8f5',
              '--c-dark-text-base': '#ede8f5',
            },
          },
        }),
      },
    })

    vm.runInNewContext(script, sandbox)
    // Canonical light values for Dusk: #f8f6fb and #3a3450
    expect(styleProps['--c-bg-base']).toBe('#f8f6fb')
    expect(styleProps['--c-text-base']).toBe('#3a3450')
  })

  it('migrates legacy development mock user ID in localStorage to mock acct and applies settings on first screen', () => {
    const script = generateHeadScript({
      mockUser: {
        id: '109424142224653388',
        acct: 'elkdev@universeodon.com',
      },
    })
    const { sandbox, classList, styleProps } = createMockEnvironment({
      cookie: 'nuxt-color-mode=light',
      localStorageData: {
        // Developer had the legacy numeric ID in localStorage
        [STORAGE_KEY_CURRENT_USER_HANDLE]: '109424142224653388',
        [STORAGE_KEY_SETTINGS]: JSON.stringify({
          'elkdev@universeodon.com': {
            fontSize: 'lg',
            preferences: { zenMode: true },
            themeSettingsVersion: 2,
            themeColors: {
              '--theme-color-name': '#b8956a',
              '--rgb-primary': '184, 149, 106',
              '--c-bg-base': '#faf8f5',
              '--c-text-base': '#3d3426',
            },
          },
        }),
      },
    })

    vm.runInNewContext(script, sandbox)
    // Handle should be migrated in localStorage
    expect(sandbox.localStorage.getItem(STORAGE_KEY_CURRENT_USER_HANDLE)).toBe('elkdev@universeodon.com')
    // Settings for elkdev@universeodon.com should be applied immediately
    expect(classList.has('zen')).toBe(true)
    expect(styleProps['--font-size']).toBe('16px')
    expect(styleProps['--c-bg-base']).toBe('#faf8f5')
  })
})
