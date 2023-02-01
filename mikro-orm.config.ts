/* eslint-disable import/no-default-export -- Required by config */

import { Options } from '@mikro-orm/core';
import * as dotenv from 'dotenv';

import { ENTITIES } from './src/modules/shared/database';

dotenv.config();

export default {
  entities: [...ENTITIES],
  clientUrl: process.env['DB_URL'],
  type: 'postgresql',
  migrations: {
    path: './migrations',
    transactional: true,
    allOrNothing: true,
    snapshot: false,
  },
} satisfies Options;
