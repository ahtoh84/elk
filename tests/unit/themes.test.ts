import { describe, expect, it } from 'vitest'
import { getThemeColors, themesColor } from '../../scripts/generate-themes'

describe('tangerine themes', () => {
  it('exposes all Tangerine palettes', () => {
    expect(themesColor).toEqual([
      '#b8956a',
      '#8a70c0',
      '#c05050',
      '#242424',
      '#4080c0',
      '#0a9a9a',
    ])
  })

  it('contains light and dark surface variables for each palette', () => {
    for (const color of themesColor) {
      expect(getThemeColors(color)).toEqual(expect.objectContaining({
        '--theme-color-label': expect.any(String),
        '--c-bg-base': expect.any(String),
        '--c-bg-panel': expect.any(String),
        '--c-text-base': expect.any(String),
        '--c-border': expect.any(String),
        '--c-dark-bg-base': expect.any(String),
        '--c-dark-bg-panel': expect.any(String),
        '--c-dark-text-base': expect.any(String),
        '--c-dark-border': expect.any(String),
      }))
    }
  })

  it('uses the palette-specific backgrounds', () => {
    expect(getThemeColors('#8a70c0')).toEqual(expect.objectContaining({
      '--c-bg-base': '#f8f6fb',
      '--c-bg-panel': '#ffffff',
      '--c-dark-bg-base': '#16141c',
      '--c-dark-bg-panel': '#221f2c',
    }))
  })

  it('keeps each dark preview color independent from the selected theme', () => {
    expect(getThemeColors('#4080c0')).toEqual(expect.objectContaining({
      '--rgb-primary': '64, 128, 192',
      '--rgb-dark-primary': '106, 155, 208',
    }))
  })

  it('uses a distinct ink accent in both color modes', () => {
    expect(getThemeColors('#242424')).toEqual(expect.objectContaining({
      '--rgb-primary': '36, 36, 36',
      '--rgb-dark-primary': '238, 238, 238',
    }))
  })

  it('exposes English names for the palette controls', () => {
    expect(getThemeColors('#b8956a')['--theme-color-label']).toBe('Paper')
    expect(getThemeColors('#8a70c0')['--theme-color-label']).toBe('Dusk')
    expect(getThemeColors('#c05050')['--theme-color-label']).toBe('Ember')
    expect(getThemeColors('#242424')['--theme-color-label']).toBe('Ink')
    expect(getThemeColors('#4080c0')['--theme-color-label']).toBe('Midnight')
    expect(getThemeColors('#0a9a9a')['--theme-color-label']).toBe('Ocean')
  })
})
