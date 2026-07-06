import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// eslint-disable-next-line import-x/no-default-export -- Required by Vitest
export default defineConfig({
  oxc: false,
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    globals: true,
    setupFiles: ['reflect-metadata'],
  },
});
