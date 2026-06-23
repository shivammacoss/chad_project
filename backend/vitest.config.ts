import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['./src/__tests__/setup.ts'],
    // Run test files sequentially: each file spins its own in-memory MongoDB;
    // parallel files occasionally race on startup. Sequential = deterministic.
    fileParallelism: false,
  },
})
