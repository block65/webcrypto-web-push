import { defineConfig } from '@playwright/test';

export default defineConfig({
  // a real subscription and delivery, over the network
  timeout: 120_000,
  reporter: 'list',
});
