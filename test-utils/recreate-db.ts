import { Knex } from 'knex';
import { resolve } from 'path';

export async function recreateDb(knex: Knex) {
  const directory = resolve(__dirname, '../migrations');

  await knex.migrate.forceFreeMigrationsLock({
    directory,
    disableMigrationsListValidation: true,
  });
  await knex.migrate.rollback(
    {
      directory,
      disableMigrationsListValidation: true,
    },
    true,
  );
  await knex.migrate.latest({
    directory,
    disableMigrationsListValidation: true,
  });
}
