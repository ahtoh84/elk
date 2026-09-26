import type { DraftItem } from '#shared/types'

export function ensureDraftItems(
  drafts: DraftItem[] | DraftItem | undefined,
  initial: () => DraftItem,
): DraftItem[] {
  if (!drafts || (Array.isArray(drafts) && drafts.length === 0))
    return [initial()]

  return Array.isArray(drafts) ? drafts : [drafts]
}
