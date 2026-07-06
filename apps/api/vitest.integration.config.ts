import { mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config';

// eslint-disable-next-line import-x/no-default-export -- Required by Vitest
export default mergeConfig(baseConfig, {
  test: {
    include: ['src/**/*.test.ts'],
    setupFiles: ['reflect-metadata', './vitest.setup.integration.ts'],
    fileParallelism: false,
    testTimeout: 30000,
  },
});
