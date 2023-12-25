import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    env: {
      NODE_ENV: 'test',
    },
    maxThreads: 1,
    minThreads: 1,
  },
  resolve: {
    alias: {
      $: resolve(__dirname, './src'),
    },
  },
});
