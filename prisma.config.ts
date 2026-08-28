import { defineConfig } from 'prisma/config';

// eslint-disable-next-line import-x/no-default-export -- Required by prisma
export default defineConfig({
  schema: 'apps/api/prisma/schema.prisma',
  datasource: {
    url: process.env['DB_URL'],
  },
});
