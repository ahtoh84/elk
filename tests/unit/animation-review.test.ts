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

    expect(wrapper.html()).toContain('duration-150')
    expect(wrapper.html()).not.toContain('duration-300')
  })
})
