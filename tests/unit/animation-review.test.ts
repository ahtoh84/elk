import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import CommandItem from '~/components/command/CommandItem.vue'
import AnimateNumber from '~/components/common/AnimateNumber.vue'

describe('animation review refinements', () => {
  it('updates the command palette active row without a keyboard transition', async () => {
    const wrapper = await mountSuspended(CommandItem, {
      props: {
        cmd: { icon: '', name: 'Search', description: undefined, bindings: undefined },
        index: 0,
        active: false,
      },
    })

    expect(wrapper.classes()).not.toContain('transition-all')
    expect(wrapper.classes()).not.toContain('duration-65')

    await wrapper.setProps({ active: true })

    expect(wrapper.classes()).toContain('bg-active')
  })

  it('keeps the status counter roll brief', async () => {
    const wrapper = await mountSuspended(AnimateNumber, {
      props: { increased: true },
      slots: { default: () => '2', next: () => '3' },
    })

    expect(wrapper.html()).toContain('animate-number-roll')
    expect(wrapper.html()).not.toContain('duration-300')

    const source = readFileSync(resolve(process.cwd(), 'app/components/common/AnimateNumber.vue'), 'utf8')
    expect(source).toMatch(/transition:\s*transform var\(--motion-moderate/)
    expect(source).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('animates the route indicator without changing layout dimensions', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/components/common/CommonRouteTabs.vue'), 'utf8')

    expect(source).toContain('scaleX(')
    expect(source).not.toMatch(/width var\(--motion-/)
  })

  it('uses ease-out curves for UI exits', () => {
    const exitFiles = [
      'app/constants/motion.ts',
      'app/styles/vars.css',
      'app/styles/global.css',
      'app/components/modal/ModalDialog.vue',
      'app/components/nav/NavBottomMoreMenu.vue',
    ]
    const easeInFiles = exitFiles.filter((file) => {
      const source = readFileSync(resolve(process.cwd(), file), 'utf8')
      return source.includes('ease-in') || source.includes('cubic-bezier(0.4, 0, 1, 1)')
    })

    expect(easeInFiles).toEqual([])
  })

  it('keeps status icon swaps visually subtle', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/components/status/StatusActionButton.vue'), 'utf8')

    expect(source).toContain('transform: scale(0.94)')
    expect(source).not.toContain('transform: scale(0.65)')
  })

  it('keeps reduced-motion bottom navigation movement gentle', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/layouts/default.vue'), 'utf8')

    expect(source).toContain('transition: opacity var(--motion-moderate-exit, 120ms) ease-out;')
    expect(source).toContain('transform: none;')
    expect(source).toContain('opacity: 0;')
    expect(source).not.toContain('transition-duration: 0ms;')
  })

  it('limits reviewed interactive transitions to the properties they change', () => {
    const reviewedFiles = [
      'app/components/status/StatusActionButton.vue',
      'app/components/status/StatusEmbeddedMedia.vue',
      'app/components/settings/SettingsThemeColors.vue',
      'app/components/common/CommonRouteTabs.vue',
      'app/components/status/StatusReactedBy.vue',
      'app/pages/[[server]]/collections/index.vue',
    ]
    const broadTransitions = reviewedFiles.filter((file) => {
      const source = readFileSync(resolve(process.cwd(), file), 'utf8')
      return source.includes('transition-all')
    })

    expect(broadTransitions).toEqual([])
  })

  it('removes press and continuous animation movement for reduced-motion users', () => {
    const source = readFileSync(resolve(process.cwd(), 'app/styles/global.css'), 'utf8')
    const reducedMotionBlock = source.split('@media (prefers-reduced-motion: reduce)')[1]
    const transformResetRules = reducedMotionBlock.match(/[^{}]+\{\s*transform:\s*none;\s*\}/g) ?? []

    expect(source).toContain('.motion-pressable:active:not(:disabled)')
    expect(transformResetRules.some(rule => rule.includes('.motion-pressable:active:not(:disabled)'))).toBe(true)
    expect(source).toContain('.animate-spin,')
    expect(source).toContain('.animate-pulse,')
    expect(source).toContain('.animate-shake-x')
  })
})
