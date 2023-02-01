import { Options } from '@mikro-orm/core';
import * as dotenv from 'dotenv';

import { ENTITIES } from './src/modules/shared/database';

dotenv.config();

const config: Options = {
  entities: [...ENTITIES],
  clientUrl: process.env['DB_URL'],
  type: 'postgresql',
  migrations: {
    path: './migrations',
    transactional: true,
    allOrNothing: true,
  },
};

export default config;
