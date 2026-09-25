import type { ThemeColors } from '../app/composables/settings'

const HEX_BYTE_REGEX = /.{2}/g

interface TangerinePalette {
  primary: string
  primaryActive: string
  darkPrimary: string
  darkPrimaryActive: string
}

// TangerineUI palettes adapted from TangerineUI-paper.css and its variants.
// The base Paper background/text palette remains in vars.css; these values
// control the light and dark accent colors exposed by Elk's theme picker.
const TANGERINE_PALETTES: TangerinePalette[] = [
  {
    primary: '#b8956a',
    primaryActive: '#a08050',
    darkPrimary: '#d4a574',
    darkPrimaryActive: '#e0b584',
  },
  {
    primary: '#8a70c0',
    primaryActive: '#7860b0',
    darkPrimary: '#9575cd',
    darkPrimaryActive: '#a585dd',
  },
  {
    primary: '#c05050',
    primaryActive: '#a84040',
    darkPrimary: '#d06050',
    darkPrimaryActive: '#e07060',
  },
  {
    primary: '#242424',
    primaryActive: '#3c3c3c',
    darkPrimary: '#eeeeee',
    darkPrimaryActive: '#ffffff',
  },
  {
    primary: '#4080c0',
    primaryActive: '#3070b0',
    darkPrimary: '#ffffff',
    darkPrimaryActive: '#e0e0e0',
  },
  {
    primary: '#0a9a9a',
    primaryActive: '#088080',
    darkPrimary: '#26a69a',
    darkPrimaryActive: '#36b6aa',
  },
]

export const themesColor = TANGERINE_PALETTES.map(({ primary }) => primary)

export function getThemeColors(primary: string): ThemeColors {
  const palette = TANGERINE_PALETTES.find(theme => theme.primary === primary)
  if (!palette)
    throw new Error(`Unknown Tangerine palette: ${primary}`)

  const primaryRgb = hexToRgb(palette.primary)
  const darkPrimaryRgb = hexToRgb(palette.darkPrimary)

  return {
    '--theme-color-name': primary,

    '--c-primary': 'rgb(var(--rgb-primary))',
    '--c-primary-active': palette.primaryActive,
    '--c-primary-light': `${palette.primary}80`,
    '--c-primary-fade': `${palette.primary}14`,
    '--rgb-primary': primaryRgb,

    '--c-dark-primary': 'rgb(var(--rgb-dark-primary))',
    '--c-dark-primary-active': palette.darkPrimaryActive,
    '--c-dark-primary-light': `${palette.darkPrimary}80`,
    '--c-dark-primary-fade': `${palette.darkPrimary}1f`,
    '--rgb-dark-primary': darkPrimaryRgb,
  }
}

function hexToRgb(hex: string) {
  return hex
    .slice(1)
    .match(HEX_BYTE_REGEX)!
    .map(value => Number.parseInt(value, 16))
    .join(', ')
}

export const colorsMap = themesColor.map(color => [color, getThemeColors(color)])
