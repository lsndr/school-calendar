import { Provider } from '@nestjs/common';
import { knex, Knex } from 'knex';
import { DateTime } from 'luxon';
import { types } from 'pg';

export const KNEX_PROVIDER = Symbol.for('KNEX_PROVIDER');

types.setTypeParser(types.builtins.TIMESTAMP, (val) =>
  DateTime.fromSQL(val, { setZone: true }),
);

types.setTypeParser(types.builtins.TIMESTAMPTZ, (val) =>
  DateTime.fromSQL(val, { setZone: true }),
);

types.setTypeParser(types.builtins.DATE, (val) =>
  DateTime.fromSQL(val, { setZone: true }),
);

const knexFactory = (): Knex => {
  if (typeof process.env['DB_URL'] === 'undefined') {
    throw new Error('DB_URL is required');
  }

  return knex({
    client: 'pg',
    connection: process.env['DB_URL'],
    pool: {
      min: 5,
      max: 20,
    },
  });
};

export const knexProvider: Provider = {
  provide: KNEX_PROVIDER,
  useFactory: knexFactory,
};
