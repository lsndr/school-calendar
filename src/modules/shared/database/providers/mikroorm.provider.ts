import { MikroORM } from '@mikro-orm/postgresql';
import { Provider } from '@nestjs/common';
import { DateTime } from 'luxon';
import { types } from 'pg';
import * as path from 'path';
import {
  AssignedTeacher,
  Lesson,
  Group,
  Teacher,
  School,
  Subject,
} from '@scheduler/domain';
import '@scheduler/database/subscribers';

export const ENTITIES = [
  School,
  Teacher,
  Group,
  Subject,
  Lesson,
  AssignedTeacher,
] as const;

export const mikroormProvider = {
  provide: MikroORM,
  useFactory: async () => {
    const orm = await MikroORM.init({
      entities: [...ENTITIES],
      clientUrl: process.env['DB_URL'],
      pool: {
        min: 5,
        max: 20,
      },
      migrations: {
        path: path.resolve(__dirname, '../../../../../migrations'),
        transactional: true,
        allOrNothing: true,
      },
    });

    types.setTypeParser(types.builtins.TIMESTAMP, (val) =>
      DateTime.fromSQL(val, { setZone: true }),
    );

    types.setTypeParser(types.builtins.TIMESTAMPTZ, (val) =>
      DateTime.fromSQL(val, { setZone: true }),
    );

    types.setTypeParser(types.builtins.DATE, (val) =>
      DateTime.fromSQL(val, { setZone: true }),
    );

    return orm;
  },
} satisfies Provider;
