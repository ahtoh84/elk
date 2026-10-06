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
    expect(source).toContain('transform 150ms')
    expect(source).toContain('@media (prefers-reduced-motion: reduce)')
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

    expect(source).toContain('.motion-pressable:active:not(:disabled)')
    expect(source).toContain('.animate-spin,')
    expect(source).toContain('.animate-pulse,')
    expect(source).toContain('.animate-shake-x')
  })
})
