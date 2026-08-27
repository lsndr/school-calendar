import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'apps/api/prisma/schema.prisma',
  datasource: {
    url: process.env['DB_URL'] ?? '',
  },
});
