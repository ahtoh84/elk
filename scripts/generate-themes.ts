import type { ThemeColors } from '../app/composables/settings'
import chroma from 'chroma-js'

// Paper palette adapted from TangerineUI-paper.css.
const PAPER_THEME_PRIMARY = '#b8956a'

// #cc7d24 -> hcl(67.14,62.19,59.56)
export const themesColor = [
  PAPER_THEME_PRIMARY,
  ...Array.from(
    { length: 9 },
    (_, i) => chroma.hcl((67.14 + i * 40) % 360, 62.19, 59.56).hex(),
  ),
]

export function getThemeColors(primary: string): ThemeColors {
  if (primary === PAPER_THEME_PRIMARY) {
    return {
      '--theme-color-name': PAPER_THEME_PRIMARY,
      '--c-primary': 'rgb(var(--rgb-primary))',
      '--c-primary-active': '#a08050',
      '--c-primary-light': '#b8956a80',
      '--c-primary-fade': '#b8956a14',
      '--rgb-primary': '184, 149, 106',
      '--c-dark-primary': 'rgb(var(--rgb-dark-primary))',
      '--c-dark-primary-active': '#e0b584',
      '--c-dark-primary-light': '#d4a57480',
      '--c-dark-primary-fade': '#d4a5741f',
      '--rgb-dark-primary': '212, 165, 116',
    }
  }

  const c = chroma(primary)
  const dc = c.brighten(0.1)

  return {
    '--theme-color-name': primary,

    '--c-primary': 'rgb(var(--rgb-primary))',
    '--c-primary-active': c.darken(0.5).hex(),
    '--c-primary-light': c.alpha(0.5).hex(),
    '--c-primary-fade': c.darken(0.1).alpha(0.1).hex(),
    '--rgb-primary': c.rgb().join(', '),

    '--c-dark-primary': 'rgb(var(--rgb-dark-primary))',
    '--c-dark-primary-active': dc.darken(0.5).hex(),
    '--c-dark-primary-light': dc.alpha(0.5).hex(),
    '--c-dark-primary-fade': dc.darken(0.1).alpha(0.1).hex(),
    '--rgb-dark-primary': c.rgb().join(', '),
  }
}

export const colorsMap = themesColor.map(color => [color, getThemeColors(color)])
