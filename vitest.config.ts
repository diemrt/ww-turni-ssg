import { defineConfig } from 'vitest/config'
import path from 'path'

// Minimal Vitest config for pure logic/unit tests (node environment, no jsdom needed).
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
  },
})
