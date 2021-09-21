import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  globalSetup: require.resolve('./playwright.globalSetup'),
  workers: process.env.GITHUB ? 1 : undefined,
};
export default config;
