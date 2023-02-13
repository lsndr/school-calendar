/* eslint-disable import/no-default-export -- Required by jest */
import { Config } from 'jest';

export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/*.controller.ts',
    '!**/*.dto.ts',
    '!**/*.pipe.ts',
    '!**/*.module.ts',
  ],
  coverageDirectory: './coverage',
  globalSetup: './jest.setup.ts',
  transform: {
    '^.+\\.(t|j)s$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            decorators: true,
          },
          keepClassNames: true,
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
      },
    ],
  },
} satisfies Config;
