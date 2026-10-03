import { defineConfig, devices } from '@playwright/test';

// Tests run against a production build by default (real CSP, no dev overlay).
// PW_DEV=1 uses `next dev` instead for faster iteration.
// The Next binary is called directly: pnpm's wrapper doesn't forward
// SIGTERM, which leaves an orphan next-server and hangs the run.
const PORT = Number(process.env.PW_PORT || 3100);
const NEXT = 'node_modules/.bin/next';
const serverCommand = process.env.PW_DEV
  ? `${NEXT} dev --turbopack -p ${PORT}`
  : `${NEXT} build && ${NEXT} start -p ${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: serverCommand,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
});
