import type { ThemeColors } from '../app/composables/settings'

const HEX_BYTE_REGEX = /.{2}/g

interface TangerineSurface {
  bgBase: string
  fg: string
  fgMuted: string
  secondaryBg: string
  contentBg: string
  contentFg: string
  contentFgBold: string
  contentSecondaryBg: string
  contentSecondarySeparator: string
  primary: string
  primaryActive: string
  primaryLines: string
  primaryBg: string
  lines: string
  linesTranslucent: string
  confirm: string
  reject: string
  warning: string
  textSecondary: string
  textTertiary: string
  bgErrorBase: string
}

interface TangerinePalette {
  light: TangerineSurface
  dark: TangerineSurface
}

const TANGERINE_PALETTES: Record<string, TangerinePalette> = {
  '#b8956a': {
    light: {
      bgBase: '#faf8f5',
      fg: '#3d3426',
      fgMuted: '#70604e',
      secondaryBg: '#f5f0e8',
      contentBg: '#ffffff',
      contentFg: '#3d3426',
      contentFgBold: '#2c2419',
      contentSecondaryBg: '#faf8f5',
      contentSecondarySeparator: 'rgba(61, 52, 38, 0.035)',
      primary: '#b8956a',
      primaryActive: '#a08050',
      primaryLines: 'rgba(184, 149, 106, 0.15)',
      primaryBg: 'rgba(184, 149, 106, 0.08)',
      lines: 'rgba(61, 52, 38, 0.07)',
      linesTranslucent: 'rgba(61, 52, 38, 0.1)',
      confirm: '#8a9484',
      reject: '#c08070',
      warning: '#c4a87a',
      textSecondary: '#70604e',
      textTertiary: '#908070',
      bgErrorBase: '#b66b5e',
    },
    dark: {
      bgBase: '#1c1915',
      fg: '#f5ede3',
      fgMuted: '#a89a8c',
      secondaryBg: '#352f2a',
      contentBg: '#2a2622',
      contentFg: '#f5ede3',
      contentFgBold: '#fffaf4',
      contentSecondaryBg: '#352f2a',
      contentSecondarySeparator: 'rgba(245, 237, 227, 0.06)',
      primary: '#d4a574',
      primaryActive: '#e0b584',
      primaryLines: 'rgba(212, 165, 116, 0.2)',
      primaryBg: 'rgba(212, 165, 116, 0.12)',
      lines: 'rgba(245, 237, 227, 0.12)',
      linesTranslucent: 'rgba(245, 237, 227, 0.1)',
      confirm: '#8a9484',
      reject: '#c08070',
      warning: '#c4a87a',
      textSecondary: '#c0b4a7',
      textTertiary: '#a89a8c',
      bgErrorBase: '#a75e53',
    },
  },
  '#8a70c0': {
    light: {
      bgBase: '#f8f6fb',
      fg: '#3a3450',
      fgMuted: '#635a78',
      secondaryBg: '#f0ecf8',
      contentBg: '#ffffff',
      contentFg: '#3a3450',
      contentFgBold: '#2c2740',
      contentSecondaryBg: '#f8f6fb',
      contentSecondarySeparator: 'rgba(58, 52, 80, 0.035)',
      primary: '#8a70c0',
      primaryActive: '#7860b0',
      primaryLines: 'rgba(138, 112, 192, 0.15)',
      primaryBg: 'rgba(138, 112, 192, 0.08)',
      lines: 'rgba(58, 52, 80, 0.07)',
      linesTranslucent: 'rgba(58, 52, 80, 0.1)',
      confirm: '#6a8a9a',
      reject: '#c07060',
      warning: '#c4a87a',
      textSecondary: '#635a78',
      textTertiary: '#8070a0',
      bgErrorBase: '#b8665c',
    },
    dark: {
      bgBase: '#16141c',
      fg: '#ede9f5',
      fgMuted: '#9690aa',
      secondaryBg: '#100e16',
      contentBg: '#221f2c',
      contentFg: '#ede9f5',
      contentFgBold: '#faf8ff',
      contentSecondaryBg: '#2a2834',
      contentSecondarySeparator: 'rgba(237, 233, 245, 0.06)',
      primary: '#9575cd',
      primaryActive: '#a585dd',
      primaryLines: 'rgba(149, 117, 205, 0.2)',
      primaryBg: 'rgba(149, 117, 205, 0.12)',
      lines: 'rgba(237, 233, 245, 0.12)',
      linesTranslucent: 'rgba(237, 233, 245, 0.1)',
      confirm: '#6a8a9a',
      reject: '#c08070',
      warning: '#c4a87a',
      textSecondary: '#9690aa',
      textTertiary: '#7868a0',
      bgErrorBase: '#a85f55',
    },
  },
  '#c05050': {
    light: {
      bgBase: '#fbf6f5',
      fg: '#3e2e2e',
      fgMuted: '#7a5c5c',
      secondaryBg: '#f5eeec',
      contentBg: '#ffffff',
      contentFg: '#3e2e2e',
      contentFgBold: '#302323',
      contentSecondaryBg: '#fbf6f5',
      contentSecondarySeparator: 'rgba(62, 46, 46, 0.035)',
      primary: '#c05050',
      primaryActive: '#a84040',
      primaryLines: 'rgba(192, 80, 80, 0.15)',
      primaryBg: 'rgba(192, 80, 80, 0.08)',
      lines: 'rgba(62, 46, 46, 0.07)',
      linesTranslucent: 'rgba(62, 46, 46, 0.1)',
      confirm: '#8a9484',
      reject: '#c05050',
      warning: '#c4a87a',
      textSecondary: '#7a5c5c',
      textTertiary: '#9a7878',
      bgErrorBase: '#b24a4a',
    },
    dark: {
      bgBase: '#1a1210',
      fg: '#f5e8e4',
      fgMuted: '#a08a82',
      secondaryBg: '#140e0c',
      contentBg: '#2a1e1c',
      contentFg: '#f5e8e4',
      contentFgBold: '#fff4f1',
      contentSecondaryBg: '#342826',
      contentSecondarySeparator: 'rgba(245, 232, 228, 0.06)',
      primary: '#d06050',
      primaryActive: '#e07060',
      primaryLines: 'rgba(208, 96, 80, 0.2)',
      primaryBg: 'rgba(208, 96, 80, 0.12)',
      lines: 'rgba(245, 232, 228, 0.12)',
      linesTranslucent: 'rgba(245, 232, 228, 0.1)',
      confirm: '#8a9484',
      reject: '#c08070',
      warning: '#c4a87a',
      textSecondary: '#a08a82',
      textTertiary: '#806860',
      bgErrorBase: '#ad594b',
    },
  },
  '#242424': {
    light: {
      bgBase: '#ffffff',
      fg: '#1d1d1d',
      fgMuted: '#737373',
      secondaryBg: '#f6f6f6',
      contentBg: '#ffffff',
      contentFg: '#1d1d1d',
      contentFgBold: '#111111',
      contentSecondaryBg: '#fafafa',
      contentSecondarySeparator: 'rgba(0, 0, 0, 0.035)',
      primary: '#242424',
      primaryActive: '#3c3c3c',
      primaryLines: 'rgba(0, 0, 0, 0.12)',
      primaryBg: 'rgba(0, 0, 0, 0.045)',
      lines: 'rgba(0, 0, 0, 0.055)',
      linesTranslucent: 'rgba(0, 0, 0, 0.08)',
      confirm: '#555555',
      reject: '#333333',
      warning: '#555555',
      textSecondary: '#737373',
      textTertiary: '#999999',
      bgErrorBase: '#333333',
    },
    dark: {
      bgBase: '#080808',
      fg: '#eeeeee',
      fgMuted: '#9c9c9c',
      secondaryBg: '#171717',
      contentBg: '#111111',
      contentFg: '#eeeeee',
      contentFgBold: '#f7f7f7',
      contentSecondaryBg: '#181818',
      contentSecondarySeparator: 'rgba(255, 255, 255, 0.06)',
      primary: '#eeeeee',
      primaryActive: '#ffffff',
      primaryLines: 'rgba(255, 255, 255, 0.15)',
      primaryBg: 'rgba(255, 255, 255, 0.07)',
      lines: 'rgba(255, 255, 255, 0.085)',
      linesTranslucent: 'rgba(255, 255, 255, 0.07)',
      confirm: '#cfcfcf',
      reject: '#cfcfcf',
      warning: '#cfcfcf',
      textSecondary: '#b8b8b8',
      textTertiary: '#9c9c9c',
      bgErrorBase: '#555555',
    },
  },
  '#4080c0': {
    light: {
      bgBase: '#f8f9fa',
      fg: '#2c3038',
      fgMuted: '#585e6e',
      secondaryBg: '#ecedef',
      contentBg: '#ffffff',
      contentFg: '#2c3038',
      contentFgBold: '#20242b',
      contentSecondaryBg: '#f8f9fa',
      contentSecondarySeparator: 'rgba(44, 48, 56, 0.035)',
      primary: '#4080c0',
      primaryActive: '#3070b0',
      primaryLines: 'rgba(64, 128, 192, 0.15)',
      primaryBg: 'rgba(64, 128, 192, 0.08)',
      lines: 'rgba(44, 48, 56, 0.07)',
      linesTranslucent: 'rgba(44, 48, 56, 0.1)',
      confirm: '#6cb06c',
      reject: '#c07060',
      warning: '#d4a060',
      textSecondary: '#585e6e',
      textTertiary: '#8e8e93',
      bgErrorBase: '#b36459',
    },
    dark: {
      bgBase: '#000000',
      fg: '#fafafa',
      fgMuted: '#808080',
      secondaryBg: '#0a0a0a',
      contentBg: '#0a0a0a',
      contentFg: '#fafafa',
      contentFgBold: '#ffffff',
      contentSecondaryBg: '#1a1a1a',
      contentSecondarySeparator: 'rgba(255, 255, 255, 0.06)',
      primary: '#6a9bd0',
      primaryActive: '#82b0dc',
      primaryLines: 'rgba(106, 155, 208, 0.2)',
      primaryBg: 'rgba(106, 155, 208, 0.12)',
      lines: 'rgba(255, 255, 255, 0.12)',
      linesTranslucent: 'rgba(255, 255, 255, 0.1)',
      confirm: '#30d158',
      reject: '#ff453a',
      warning: '#ff9f0a',
      textSecondary: '#b0b0b0',
      textTertiary: '#808080',
      bgErrorBase: '#c63b33',
    },
  },
  '#0a9a9a': {
    light: {
      bgBase: '#f5fafa',
      fg: '#2d4a4a',
      fgMuted: '#4a6868',
      secondaryBg: '#eaf5f5',
      contentBg: '#ffffff',
      contentFg: '#2d4a4a',
      contentFgBold: '#203838',
      contentSecondaryBg: '#f5fafa',
      contentSecondarySeparator: 'rgba(45, 74, 74, 0.035)',
      primary: '#0a9a9a',
      primaryActive: '#088080',
      primaryLines: 'rgba(10, 154, 154, 0.15)',
      primaryBg: 'rgba(10, 154, 154, 0.08)',
      lines: 'rgba(45, 74, 74, 0.07)',
      linesTranslucent: 'rgba(45, 74, 74, 0.1)',
      confirm: '#26a69a',
      reject: '#c07060',
      warning: '#d4a060',
      textSecondary: '#4a6868',
      textTertiary: '#6a8a8a',
      bgErrorBase: '#b76458',
    },
    dark: {
      bgBase: '#0c1618',
      fg: '#e0f2f1',
      fgMuted: '#6a9a9a',
      secondaryBg: '#1e2c2e',
      contentBg: '#162022',
      contentFg: '#e0f2f1',
      contentFgBold: '#f4ffff',
      contentSecondaryBg: '#1e2c2e',
      contentSecondarySeparator: 'rgba(224, 242, 241, 0.06)',
      primary: '#26a69a',
      primaryActive: '#36b6aa',
      primaryLines: 'rgba(38, 166, 154, 0.2)',
      primaryBg: 'rgba(38, 166, 154, 0.12)',
      lines: 'rgba(224, 242, 241, 0.12)',
      linesTranslucent: 'rgba(224, 242, 241, 0.1)',
      confirm: '#26a69a',
      reject: '#c07060',
      warning: '#d4a060',
      textSecondary: '#8ab0b0',
      textTertiary: '#6a9a9a',
      bgErrorBase: '#a75d52',
    },
  },
}

const TANGERINE_PALETTE_NAMES: Record<string, string> = {
  '#b8956a': 'Paper',
  '#8a70c0': 'Dusk',
  '#c05050': 'Ember',
  '#242424': 'Ink',
  '#4080c0': 'Midnight',
  '#0a9a9a': 'Ocean',
}

// Keep the default palette first because the first generated theme is used by
// `scripts/prepare.ts` to create the initial CSS variables before hydration.
export const themesColor = [
  '#242424', // Ink
  '#b8956a', // Paper
  '#8a70c0', // Dusk
  '#c05050', // Ember
  '#4080c0', // Midnight
  '#0a9a9a', // Ocean
] as const

function rgba(hex: string, alpha: number) {
  return `rgba(${hexToRgb(hex)}, ${alpha})`
}

function getSurfaceColors(surface: TangerineSurface, prefix: '--c-' | '--c-dark-') {
  const rgbPrefix = prefix === '--c-' ? '--rgb' : '--rgb-dark'
  return {
    [`${prefix}primary`]: `rgb(var(${rgbPrefix}-primary))`,
    [`${prefix}primary-active`]: surface.primaryActive,
    [`${prefix}primary-light`]: `${surface.primary}80`,
    [`${prefix}primary-fade`]: `${surface.primary}1f`,
    [`${prefix}bg-base`]: surface.bgBase,
    [`${prefix}bg-active`]: `color-mix(in srgb, ${surface.primary}, ${surface.contentBg} 96%)`,
    [`${prefix}bg-card`]: surface.contentSecondaryBg,
    [`${prefix}bg-panel`]: surface.contentBg,
    [`${prefix}bg-code`]: surface.contentSecondaryBg,
    [`${prefix}bg-selection`]: rgba(surface.primary, 0.25),
    [`${prefix}bg-dm`]: surface.secondaryBg,
    [`${prefix}bg-btn-disabled`]: surface.fgMuted,
    [`${prefix}border`]: surface.lines,
    [`${prefix}border-dark`]: surface.linesTranslucent,
    [`${prefix}border-code`]: surface.contentSecondarySeparator,
    [`${prefix}danger`]: surface.bgErrorBase,
    [`${prefix}danger-active`]: `color-mix(in srgb, ${surface.reject}, black 12%)`,
    [`${prefix}success`]: surface.confirm,
    [`${prefix}warning`]: surface.warning,
    [`${prefix}error`]: surface.reject,
    [`${prefix}text-base`]: surface.contentFg,
    [`${prefix}text-code`]: surface.primaryActive,
    [`${prefix}text-secondary`]: surface.textSecondary,
    [`${prefix}text-secondary-light`]: surface.textTertiary,
    [`${prefix}text-btn-disabled`]: surface.contentBg,
    [`${prefix}text-btn-disabled-deeper`]: surface.fgMuted,
  }
}

export function getThemeColors(primary: string): ThemeColors {
  const palette = TANGERINE_PALETTES[primary]
  if (!palette)
    throw new Error(`Unknown Tangerine palette: ${primary}`)

  return {
    '--theme-color-name': primary,
    '--theme-color-label': TANGERINE_PALETTE_NAMES[primary],
    '--rgb-primary': hexToRgb(palette.light.primary),
    '--rgb-dark-primary': hexToRgb(palette.dark.primary),
    '--rgb-bg-base': hexToRgb(palette.light.bgBase),
    '--rgb-dark-bg-base': hexToRgb(palette.dark.bgBase),
    ...getSurfaceColors(palette.light, '--c-'),
    ...getSurfaceColors(palette.dark, '--c-dark-'),
  } as ThemeColors
}

function hexToRgb(hex: string) {
  return hex
    .slice(1)
    .match(HEX_BYTE_REGEX)!
    .map(value => Number.parseInt(value, 16))
    .join(', ')
}

export const colorsMap = themesColor.map(color => [color, getThemeColors(color)])
