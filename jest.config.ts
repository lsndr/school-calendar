/* eslint-disable import/no-default-export -- Required by jest */
import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

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
  preset: 'ts-jest',
  transform: {
    '^.+\\.[tj]s?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        diagnostics: false,
        isolatedModules: true,
      },
    ],
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>',
  }),
} satisfies Config;
