import { describe, expect, it } from 'vitest'
import { getThemeColors } from '../../app/composables/theme-colors'

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
})
