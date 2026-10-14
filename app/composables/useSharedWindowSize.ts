import { createSharedComposable, useWindowSize } from '@vueuse/core'

export const useSharedWindowSize = createSharedComposable(useWindowSize)
