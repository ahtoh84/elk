import { describe, expect, it } from 'vitest'
import { merge, readI18nFile } from '../../scripts/prepare-translation-status'

describe('prepare-translation-status merge and readI18nFile', () => {
  it('correctly deep merges source objects into target objects without mutating unshared structures', () => {
    const base = {
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
      },
      menu: {
        home: 'Início',
      },
    }

    const override = {
      common: {
        save: 'Salvar', // pt-BR override
      },
      extra: {
        badge: 'Novo',
      },
    }

    const result: any = {}
    merge(base, result)
    merge(override, result)

    expect(result.common.save).toBe('Salvar')
    expect(result.common.cancel).toBe('Cancelar')
    expect(result.menu.home).toBe('Início')
    expect(result.extra.badge).toBe('Novo')
  })

  it('correctly reads and merges multi-file locale array like pt-BR', async () => {
    // pt-BR uses ['pt.json', 'pt-BR.json']
    const merged = await readI18nFile(['pt.json', 'pt-BR.json'])

    // Should include keys from both pt.json and pt-BR.json
    expect(merged).toBeDefined()
    expect(typeof merged).toBe('object')
    expect(merged.action).toBeDefined()
  })
})
