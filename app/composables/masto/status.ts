import type { mastodon } from 'masto'
import type { Ref } from 'vue'

type Action = 'reblogged' | 'favourited' | 'bookmarked' | 'pinned' | 'muted'
type CountField = 'reblogsCount' | 'favouritesCount' | 'quotesCount'

export interface StatusActionsProps {
  status: mastodon.v1.Status
}

export interface StatusActionsDependencies {
  cacheStatus?: (status: mastodon.v1.Status, server?: string, override?: boolean) => void
  checkLogin?: () => boolean
  client?: Ref<mastodon.rest.Client>
}

export function useStatusActions(props: StatusActionsProps, dependencies: StatusActionsDependencies = {}) {
  const status = ref<mastodon.v1.Status>({ ...props.status })
  const client = dependencies.client ?? useMasto().client
  const canPerformAction = dependencies.checkLogin ?? checkLogin
  const saveStatus = dependencies.cacheStatus ?? cacheStatus

  watch(
    () => props.status,
    val => status.value = { ...val },
    { deep: true, immediate: true },
  )

  // Use different states to let the user press different actions right after the other
  const isLoading = ref({
    reblogged: false,
    favourited: false,
    bookmarked: false,
    pinned: false,
    translation: false,
    muted: false,
  })
  const actionError = ref(false)

  async function toggleStatusAction(action: Action, fetchNewStatus: () => Promise<mastodon.v1.Status>, countField?: CountField) {
    // check login
    if (!canPerformAction())
      return

    const wasActive = status.value[action]
    const prevCount = countField ? status.value[countField] : undefined
    actionError.value = false
    isLoading.value[action] = true

    try {
      // Resolve the endpoint from the current state before applying the optimistic toggle.
      const request = fetchNewStatus()

      // Optimistically update the UI while the request is in flight.
      status.value[action] = !wasActive
      if (countField)
        status.value[countField] += status.value[action] ? 1 : -1
      saveStatus(status.value, undefined, true)

      const newStatus = await request
      // when the action is cancelled, the count is not updated highly likely (if they're the same)
      // issue of Mastodon API
      if (wasActive && countField && prevCount === newStatus[countField])
        newStatus[countField] -= 1

      Object.assign(status.value, newStatus)
      saveStatus(newStatus, undefined, true)
    }
    catch {
      // Roll back only this action so other concurrent status actions stay intact.
      status.value[action] = wasActive
      if (countField && prevCount !== undefined)
        status.value[countField] = prevCount
      saveStatus(status.value, undefined, true)
      actionError.value = true
    }
    finally {
      isLoading.value[action] = false
    }
  }

  const toggleFavourite = () => toggleStatusAction(
    'favourited',
    () => client.value.v1.statuses.$select(status.value.id)[status.value.favourited ? 'unfavourite' : 'favourite'](),
    'favouritesCount',
  )

  const canReblog = computed(() =>
    status.value.visibility !== 'direct'
    && (status.value.visibility !== 'private' || status.value.account.id === currentUser.value?.account.id),
  )

  const toggleReblog = () => {
    const wasReblogged = status.value.reblogged
    return toggleStatusAction(
      'reblogged',
      () => client.value.v1.statuses.$select(status.value.id)[wasReblogged ? 'unreblog' : 'reblog']().then((res) => {
        if (wasReblogged) {
          // Returns the original status when unboosting.
          return res.reblog!
        }
        return res
      }),
      'reblogsCount',
    )
  }

  const canQuote = computed(() => {
    if (status.value.visibility === 'private' || status.value.visibility === 'direct')
      return false

    return status.value.quoteApproval?.currentUser === 'automatic' || status.value.quoteApproval?.currentUser === 'manual'
  })

  const composeWithQuote = () => navigateTo(`/compose?quote=${status.value.id}`)

  const toggleBookmark = () => toggleStatusAction(
    'bookmarked',
    () => client.value.v1.statuses.$select(status.value.id)[status.value.bookmarked ? 'unbookmark' : 'bookmark'](),
  )

  const togglePin = async () => toggleStatusAction(
    'pinned',
    () => client.value.v1.statuses.$select(status.value.id)[status.value.pinned ? 'unpin' : 'pin'](),
  )

  const toggleMute = async () => toggleStatusAction(
    'muted',
    () => client.value.v1.statuses.$select(status.value.id)[status.value.muted ? 'unmute' : 'mute'](),
  )

  return {
    status,
    isLoading,
    actionError,
    canQuote,
    canReblog,
    toggleMute,
    toggleReblog,
    toggleFavourite,
    toggleBookmark,
    togglePin,
    composeWithQuote,
  }
}
