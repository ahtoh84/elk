import { defineVitestProject } from '@nuxt/test-utils/config'
import { isCI } from 'std-env'
import { defineConfig } from 'vitest/config'

// Keep snapshots independent from the deployment's configured public instance.
process.env.NUXT_PUBLIC_DEFAULT_SERVER ??= 'm.webtoo.ls'

export default defineConfig({
  define: {
    'process.test': 'true',
  },
  test: {
    reporters: isCI ? ['default', 'hanging-process'] : ['default'],
    projects: [
      await defineVitestProject({
        test: {
          name: 'nuxt',
          setupFiles: [
            '../tests/setup.ts',
          ],
          environmentOptions: {
            nuxt: {
              mock: {
                indexedDb: true,
                intersectionObserver: true,
              },
            },
          },
        },
      }),
    ],
  },
})
