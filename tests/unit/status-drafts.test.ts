import type { DraftItem } from '#shared/types'
import { describe, expect, it } from 'vitest'
import { ensureDraftItems } from '../../app/composables/masto/statusDraftsUtils'

const draft = {} as DraftItem

describe('status drafts', () => {
  it('creates a default draft when the stored draft list is empty', () => {
    expect(ensureDraftItems([], () => draft)).toEqual([draft])
  })

  it('keeps existing draft items unchanged', () => {
    expect(ensureDraftItems([draft], () => ({}) as DraftItem)).toEqual([draft])
  })
})
