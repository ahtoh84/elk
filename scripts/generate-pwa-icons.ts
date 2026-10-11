import type { Buffer } from 'node:buffer'
import type { PngOptions, ResizeOptions } from 'sharp'
import { copyFile, rm, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { resolve } from 'pathe'
import sharp from 'sharp'
import ico from 'sharp-ico'

const TEMP_PNG_POSTFIX_RE = /-temp\.png$/
interface Icon {
  sizes: number[]
  padding: number
  resizeOptions?: ResizeOptions
}

type IconType = 'transparent' | 'maskable' | 'apple'

/**
 * PWA Icons definition:
 * - transparent: [{ sizes: [192, 512], padding: 0.05, resizeOptions: { fit: 'contain', background: transparent } }]
 * - maskable: [{ sizes: [512], padding: 0.42 }, resizeOptions: { fit: 'contain', background: transparent } }]
 * - apple: [{ sizes: [180], padding: 0.3 }, resizeOptions: { fit: 'contain', background: transparent } }]
 */
interface Icons extends Record<IconType, Icon> {
  /**
   * @default: `{ compressionLevel: 9, palette: false }`
   */
  png?: PngOptions
  /**
   * @default `pwa-<size>x<size>.png`, `maskable-icon-<size>x<size>.png`, `apple-touch-icon-<size>x<size>.png`
   */
  iconName?: (type: IconType, size: number) => string
  /**
   * Generate `favicon.ico` from transparent icons (from `pwa-<size>x<size>.png` ones)
   */
  ico?: {
    /**
     * @default `favicon-<size>x<size>.ico`
     */
    icoName?: (size: number) => string
    sizes: number[]
  }
}

interface ResolvedIcons extends Required<Omit<Icons, 'ico'>> {
  ico?: {
    /**
     * @default `favicon-<size>x<size>.ico`
     */
    icoName?: (size: number) => string
    sizes: number[]
  }
}

const transparentBackground = { r: 0, g: 0, b: 0, alpha: 0 }

const defaultIcons: Icons = {
  transparent: {
    sizes: [192, 512],
    padding: 0.05,
    resizeOptions: {
      fit: 'contain',
      background: transparentBackground,
    },
  },
  maskable: {
    sizes: [512],
    // Keep the antler tips intact when a launcher applies a circular mask.
    padding: 0.42,
    resizeOptions: {
      fit: 'contain',
      background: transparentBackground,
    },
  },
  apple: {
    sizes: [180],
    padding: 0.3,
    resizeOptions: {
      fit: 'contain',
      background: transparentBackground,
    },
  },
}

const root = process.cwd()

const publicFolders = ['public', 'public-dev', 'public-staging', 'docs/public'].map(folder => resolve(root, folder))

async function prepareLogoSource() {
  const inputPath = resolve(root, 'public/deer-with-rainbow-antlers.png')
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let left = info.width
  let top = info.height
  let right = -1
  let bottom = -1

  // Ignore near-invisible speckles outside the artwork when finding its bounds.
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * info.channels + info.channels - 1] < 16)
        continue
      left = Math.min(left, x)
      top = Math.min(top, y)
      right = Math.max(right, x)
      bottom = Math.max(bottom, y)
    }
  }

  if (right < left || bottom < top)
    throw new Error('The logo source has no visible artwork')

  // Retain a narrow antialiasing fringe without the original oversized canvas.
  left = Math.max(0, left - 2)
  top = Math.max(0, top - 2)
  right = Math.min(info.width - 1, right + 2)
  bottom = Math.min(info.height - 1, bottom + 2)
  const width = right - left + 1
  const height = bottom - top + 1
  const size = Math.max(width, height)
  const png = await sharp(inputPath)
    .extract({ left, top, width, height })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <title>Elk</title>
  <image x="${(size - width) / 2}" y="${(size - height) / 2}" width="${width}" height="${height}" href="data:image/png;base64,${png.toString('base64')}" />
</svg>
`

  await Promise.all(publicFolders.map(folder => writeFile(resolve(folder, 'logo.svg'), svg)))
}

async function optimizePng(filePath: string, png: PngOptions) {
  await sharp(filePath).png(png).toFile(`${filePath.replace(TEMP_PNG_POSTFIX_RE, '.png')}`)
  await rm(filePath)
}

async function generateTransparentIcons(icons: ResolvedIcons, svgLogo: string, folder: string) {
  const { sizes, padding, resizeOptions } = icons.transparent
  await Promise.all(sizes.map(async (size) => {
    const filePath = resolve(folder, icons.iconName('transparent', size))
    const logoSize = Math.min(size - 2, Math.round(size * (1 - padding)))
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: resizeOptions?.background ?? { r: 0, g: 0, b: 0, alpha: 0 },
      },
    }).composite([{
      input: await sharp(svgLogo)
        .resize(
          logoSize,
          logoSize,
          resizeOptions,
        )
        .toBuffer(),
    }]).toFile(filePath)
    await optimizePng(filePath, icons.png)
  }))
}

async function generateMaskableIcons(type: IconType, icons: ResolvedIcons, svgLogo: string, folder: string) {
  const { sizes, padding, resizeOptions } = icons[type]
  await Promise.all(sizes.map(async (size) => {
    const filePath = resolve(folder, icons.iconName(type, size))
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: resizeOptions?.background ?? transparentBackground,
      },
    }).composite([{
      input: await sharp(svgLogo)
        .resize(
          Math.round(size * (1 - padding)),
          Math.round(size * (1 - padding)),
          resizeOptions,
        )
        .toBuffer(),
    }]).toFile(filePath)
    await optimizePng(filePath, icons.png)
  }))
}

async function generatePWAIconForEnv(folder: string, icons: ResolvedIcons) {
  const svgLogo = resolve(folder, 'logo.svg')
  await Promise.all([
    generateTransparentIcons(icons, svgLogo, folder),
    generateMaskableIcons('maskable', icons, svgLogo, folder),
    generateMaskableIcons('apple', icons, svgLogo, folder),
  ])

  if (icons.ico) {
    const {
      icoName = size => `favicon-${size}x${size}.ico`,
    } = icons.ico
    const faviconImages = new Map<string, Buffer[]>()
    for (const size of icons.ico.sizes) {
      const png = await sharp(
        resolve(folder, icons.iconName('transparent', size).replace(TEMP_PNG_POSTFIX_RE, '.png')),
      ).toFormat('png').toBuffer()
      const name = icoName(size)
      const images = faviconImages.get(name) ?? []
      images.push(png)
      faviconImages.set(name, images)
    }
    await Promise.all(Array.from(faviconImages, ([name, images]) =>
      writeFile(resolve(folder, name), new Uint8Array(ico.encode(images)))))
  }

  await copyFile(resolve(folder, 'pwa-512x512.png'), resolve(folder, 'elk.png'))
}

async function generatePWAIcons(folders: string[], icons: Icons) {
  const {
    png = { compressionLevel: 9, palette: false },
    iconName = (type, size) => {
      switch (type) {
        case 'transparent':
          return `pwa-${size}x${size}.png`
        case 'maskable':
          return `maskable-icon-${size}x${size}.png`
        case 'apple':
          return `apple-touch-icon-${size}x${size}.png`
      }
    },
    transparent = { ...defaultIcons.transparent },
    maskable = { ...defaultIcons.maskable },
    apple = { ...defaultIcons.apple },
    ico,
  } = icons

  if (!transparent.resizeOptions)
    transparent.resizeOptions = { ...defaultIcons.transparent.resizeOptions }

  if (!maskable.resizeOptions)
    maskable.resizeOptions = { ...defaultIcons.maskable.resizeOptions }

  if (!apple.resizeOptions)
    apple.resizeOptions = { ...defaultIcons.apple.resizeOptions }

  await Promise.all(folders.map(folder => generatePWAIconForEnv(folder, {
    png,
    iconName,
    transparent,
    maskable,
    apple,
    ico,
  })))
}

console.log('Generating Elk PWA Icons...')

try {
  await prepareLogoSource()
  await generatePWAIcons(publicFolders, {
    transparent: { ...defaultIcons.transparent, sizes: [16, 32, 48, 64, 192, 512, 1080] },
    ico: { sizes: [16, 32, 48, 64], icoName: _ => 'favicon.ico' },
    iconName: (type, size) => {
      switch (type) {
        case 'transparent':
          if (size === 1080)
            return 'elk-logo-1080-temp.png'
          if (size < 64)
            return `favicon-${size}x${size}-temp.png`
          return `pwa-${size}x${size}-temp.png`
        case 'maskable':
          return 'maskable-icon-temp.png'
        case 'apple':
          return 'apple-touch-icon-temp.png'
      }
    },
  } as Icons)
  console.log('Elk PWA Icons generated')
}
catch (error) {
  console.error(error)
  process.exitCode = 1
}
