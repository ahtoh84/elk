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
})
