import { defineConfig, devices } from '@playwright/test';

// Visual regression over the per-theme "all components" pages. Baselines are generated only in
// CI's Linux image (workflow_dispatch "update snapshots"), because text renders differently per OS.
export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  webServer: { command: 'npm run preview -- --port 4390', port: 4390, reuseExistingServer: true },
  use: { baseURL: 'http://127.0.0.1:4390', reducedMotion: 'reduce', colorScheme: 'light' },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.001, animations: 'disabled' } },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
});
