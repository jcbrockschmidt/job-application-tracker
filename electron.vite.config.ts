import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load .env from project root. All variables are loaded (no prefix filter),
  // but only AI_PLACEHOLDER is injected into the main process bundle below.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    main: {
      plugins: [
        externalizeDepsPlugin(),
        viteStaticCopy({ targets: [{ src: 'src/main/db/migrations', dest: '.' }] })
      ],
      resolve: {
        alias: {
          '@shared': resolve('src/shared')
        }
      },
      define: {
        // Inject .env value so process.env.AI_PLACEHOLDER works in the main process.
        // Empty string when unset → isPlaceholderMode() returns false.
        'process.env.AI_PLACEHOLDER': JSON.stringify(env.AI_PLACEHOLDER ?? '')
      }
    },
    preload: {
      plugins: [externalizeDepsPlugin()],
      resolve: {
        alias: {
          '@shared': resolve('src/shared')
        }
      }
    },
    renderer: {
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src'),
          '@shared': resolve('src/shared')
        }
      },
      plugins: [react()]
    }
  }
})
