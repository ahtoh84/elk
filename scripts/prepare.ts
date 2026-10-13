import { cp, mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import process from 'node:process'
import { emojiPrefix, iconifyEmojiPackage } from '../config/emojis.ts'
import { colorsMap } from './generate-themes.ts'

const dereference = process.platform === 'win32'

const destEmojis = `public/emojis/${emojiPrefix}`
await mkdir(dirname(destEmojis), { recursive: true })
await cp(`node_modules/${iconifyEmojiPackage}/icons`, destEmojis, {
  force: true,
  dereference,
  recursive: true,
})

await writeFile(
  'app/constants/themes.json',
  `${JSON.stringify(colorsMap, null, 2)}\n`,
  { encoding: 'utf-8' },
)

const defaultTheme = colorsMap[0][1]
const darkMappings = Object.keys(defaultTheme)
  .filter(k => k.startsWith('--c-') && !k.startsWith('--c-dark-') && defaultTheme[`--c-dark-${k.slice(4)}`])
  .map(k => `  ${k}: var(--c-dark-${k.slice(4)});`)
  .join('\n')

const rootCss = Object.entries(defaultTheme)
  .map(([k, v]) => `  ${k}: ${v};`)
  .join('\n')

const cssContent = `:root {\n${rootCss}\n}\n\n.dark {\n${darkMappings}\n}\n\n@media (prefers-color-scheme: dark) {\n  :root:not(.light) {\n${darkMappings}\n  }\n}\n`

await writeFile(
  'app/styles/default-theme.css',
  cssContent,
  { encoding: 'utf-8' },
)
