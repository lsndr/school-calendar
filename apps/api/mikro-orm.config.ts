import { type Options } from '@mikro-orm/core';
import * as dotenv from 'dotenv';
import { join } from 'path';

import { ENTITIES } from './src/modules/shared/database';

dotenv.config({
  path: join(__dirname, '.env'),
});

// eslint-disable-next-line import-x/no-default-export -- Required by config
export default {
  entities: [...ENTITIES],
  clientUrl: process.env['DB_URL'],
  type: 'postgresql',
  migrations: {
    path: join(__dirname, 'migrations'),
    transactional: true,
    allOrNothing: true,
    snapshot: false,
  },
} satisfies Options;
