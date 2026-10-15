import { describe, expect, it, vi } from 'vitest'

describe('pageLifecycle plugin listener management', () => {
  it('registers frozen listeners and allows clean unsubscribing', () => {
    const frozenListeners: (() => void)[] = []

    const removeFrozenListener = (listener: () => void) => {
      const index = frozenListeners.indexOf(listener)
      if (index !== -1)
        frozenListeners.splice(index, 1)
    }

    const addFrozenListener = (listener: () => void) => {
      frozenListeners.push(listener)
      return () => removeFrozenListener(listener)
    }

    const listener1 = vi.fn()
    const listener2 = vi.fn()

    const unsub1 = addFrozenListener(listener1)
    const unsub2 = addFrozenListener(listener2)

    expect(frozenListeners.length).toBe(2)

    // Unsubscribe listener 1
    unsub1()
    expect(frozenListeners.length).toBe(1)

    // Trigger remaining listeners
    frozenListeners.forEach(fn => fn())
    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).toHaveBeenCalledTimes(1)

    // Unsubscribe listener 2
    unsub2()
    expect(frozenListeners.length).toBe(0)
  })
})
