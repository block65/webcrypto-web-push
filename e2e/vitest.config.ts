import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // a real subscription and delivery, over the network
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
