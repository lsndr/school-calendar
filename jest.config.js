module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.ts'],
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
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
      },
    ],
  },
};
