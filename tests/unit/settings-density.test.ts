import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import SettingsBottomNav from '~/components/settings/SettingsBottomNav.vue'
import PreferencesPage from '~/pages/settings/preferences/index.vue'

const mockedSettings = vi.hoisted(() => ({ preferences: {} }))

mockNuxtImport('useUserSettings', () => () => ({ value: mockedSettings }))
mockNuxtImport('getPreferences', () => () => false)
mockNuxtImport('togglePreferences', () => vi.fn())
mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))

describe('settings density', () => {
  it('keeps less-frequently used preference groups collapsed until requested', async () => {
    const wrapper = await mountSuspended(PreferencesPage, {
      global: {
        stubs: {
          MainContent: { template: '<main><slot name="title" /><slot /></main>' },
          MainTitle: { template: '<h1><slot /></h1>' },
        },
      },
    })

    const [socialPreferences, experimentalPreferences] = wrapper.findAll('details')

    expect(socialPreferences).toBeDefined()
    expect(experimentalPreferences).toBeDefined()
    expect((socialPreferences.element as HTMLDetailsElement).open).toBe(false)
    expect((experimentalPreferences.element as HTMLDetailsElement).open).toBe(false)

    await socialPreferences.get('summary').trigger('click')
    expect((socialPreferences.element as HTMLDetailsElement).open).toBe(true)
    expect(socialPreferences.findAll('[role="checkbox"]')).toHaveLength(12)

    await experimentalPreferences.get('summary').trigger('click')
    expect((experimentalPreferences.element as HTMLDetailsElement).open).toBe(true)
    expect(experimentalPreferences.findAll('[role="checkbox"]')).toHaveLength(4)
  })

  it('starts the bottom-navigation choices collapsed and shows the current selection count', async () => {
    const wrapper = await mountSuspended(SettingsBottomNav)
    const choices = wrapper.get('details')

    expect((choices.element as HTMLDetailsElement).open).toBe(false)
    expect(wrapper.text()).toContain('5 of 5 selected')
    expect(wrapper.findAll('button[role="switch"]')).toHaveLength(15)
    expect(wrapper.findAll('button[role="switch"]:disabled')).toHaveLength(10)

    await choices.get('summary').trigger('click')
    expect((choices.element as HTMLDetailsElement).open).toBe(true)
  })

  it('explains that the More menu is required when it is removed from the selection', async () => {
    const wrapper = await mountSuspended(SettingsBottomNav)
    const choices = wrapper.get('details')
    await choices.get('summary').trigger('click')

    const switches = wrapper.findAll('button[role="switch"]')
    await switches.at(-1)!.trigger('click')

    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(wrapper.get('form button[type="submit"]').element.disabled).toBe(true)
  })

  it('allows saving a replacement set of five buttons when the More menu remains selected', async () => {
    const wrapper = await mountSuspended(SettingsBottomNav)
    const choices = wrapper.get('details')
    await choices.get('summary').trigger('click')

    const switches = wrapper.findAll('button[role="switch"]')
    await switches[9]!.trigger('click')
    await switches[1]!.trigger('click')

    expect(wrapper.findAll('button[role="switch"][aria-checked="true"]')).toHaveLength(5)
    const saveButton = wrapper.get('form button[type="submit"]')
    expect(saveButton.element.disabled).toBe(false)

    await wrapper.get('form').trigger('submit')

    expect(saveButton.element.disabled).toBe(true)
  })
})
