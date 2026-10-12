import { describe, expect, it } from 'vitest'
import { getThemeColors } from '../../app/composables/theme-colors'
import themes from '../../app/constants/themes.json'

function luminance(hex: string) {
  const channels = hex.match(/[\da-f]{2}/gi)!.map((channel) => {
    const value = Number.parseInt(channel, 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })

  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
}

function contrastRatio(foreground: string, background: string) {
  const first = luminance(foreground)
  const second = luminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

describe('theme color modes', () => {
  it('resolves the selected palette for the active color mode', () => {
    const light = getThemeColors('#242424', false)
    const dark = getThemeColors('#242424', true)

    expect(light['--c-bg-base']).toBe('#ffffff')
    expect(dark['--c-bg-base']).toBe('#080808')
    expect(light['--c-text-base']).toBe('#1d1d1d')
    expect(dark['--c-text-base']).toBe('#eeeeee')
  })

  it('falls back to the default palette for an unknown theme', () => {
    expect(getThemeColors('unknown', true)['--theme-color-name']).toBe('#242424')
  })

  it('uses distinct semantic colors in the default theme', () => {
    const light = getThemeColors('#242424', false)
    const dark = getThemeColors('#242424', true)

    expect(new Set([light['--c-success'], light['--c-warning'], light['--c-error']]).size).toBe(3)
    expect(new Set([dark['--c-success'], dark['--c-warning'], dark['--c-error']]).size).toBe(3)
  })

  it('keeps tertiary text readable on base and card surfaces in every theme mode', () => {
    for (const [themeName] of themes as [string, Record<string, string>][]) {
      for (const dark of [false, true]) {
        const colors = getThemeColors(themeName, dark)
        const foreground = colors['--c-text-secondary-light']

        for (const background of ['--c-bg-base', '--c-bg-card']) {
          expect(
            contrastRatio(foreground, colors[background]),
            `${themeName} ${dark ? 'dark' : 'light'} ${background}`,
          ).toBeGreaterThanOrEqual(4.5)
        }
      }
    }
  })
})
