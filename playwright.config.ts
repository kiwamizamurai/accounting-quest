import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
    viewport: { width: 1024, height: 768 },
  },
  webServer: {
    command: 'npx vite --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
