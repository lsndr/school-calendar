import { MikroORM } from '@mikro-orm/postgresql';
import { Provider } from '@nestjs/common';
import { mikroormProvider } from '../database';

export const testMikroormProvider = {
  provide: MikroORM,
  useFactory: async () => {
    const orm = await mikroormProvider.useFactory();

    const logger = orm.config.get('logger');
    orm.config.set('logger', () => {
      /* be silent */
    });
    await recreateDb(orm);
    orm.config.set('logger', logger);

    return orm;
  },
} satisfies Provider;

async function recreateDb(orm: MikroORM) {
  const migrator = orm.getMigrator();

  let migrationsAffected = 0;

  do {
    const result = await migrator.down();

    migrationsAffected = result.length;
  } while (migrationsAffected > 0);

  await migrator.up();
}
