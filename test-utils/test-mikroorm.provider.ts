import { MikroORM } from '@mikro-orm/postgresql';
import { Provider } from '@nestjs/common';
import * as path from 'path';
import { ENTITIES, MIKROORM_PROVIDER } from '../src/modules/shared/database';

export const testMikroormProvider = {
  provide: MIKROORM_PROVIDER,
  useFactory: () => {
    return initTestMikroORM();
  },
} satisfies Provider;

async function initTestMikroORM() {
  const orm = await MikroORM.init({
    entities: [...ENTITIES],
    clientUrl: process.env['DB_URL'],
    pool: {
      min: 5,
      max: 20,
    },
    migrations: {
      path: path.resolve(__dirname, '../migrations'),
      transactional: true,
      allOrNothing: true,
    },
  });

  const logger = orm.config.get('logger');
  orm.config.set('logger', () => {
    /* be silent */
  });
  await recreateDb(orm);
  orm.config.set('logger', logger);

  return orm;
}

async function recreateDb(orm: MikroORM) {
  const migrator = orm.getMigrator();

  let migrationsAffected = 0;

  do {
    const result = await migrator.down();

    migrationsAffected = result.length;
  } while (migrationsAffected > 0);

  await migrator.up();
}
