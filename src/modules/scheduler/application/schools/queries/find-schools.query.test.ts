import { Test } from '@nestjs/testing';
import { School, SchoolId, TimeZone } from '../../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../shared/tests';
import { CqrsModule, QueryBus } from '../../../../shared/cqrs';
import {
  FindSchoolsQuery,
  FindSchoolsQueryHandler,
} from './find-schools.query';

describe('FindSchoolsQuery', () => {
  let queryBus: QueryBus;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [FindSchoolsQueryHandler, testMikroormProvider],
    }).compile();

    queryBus = moduleRef.get(QueryBus);
    orm = moduleRef.get(MikroORM);

    await moduleRef.createNestApplication().init();
  });

  it('should find schools', async () => {
    // arrange
    await seed(orm);

    // act
    const result = await queryBus.execute(new FindSchoolsQuery());

    // assert
    expect(result).toEqual([
      {
        id: expect.any(String),
        name: 'School 1',
        timeZone: 'Europe/Moscow',
      },
      {
        id: expect.any(String),
        name: 'School 2',
        timeZone: 'Europe/London',
      },
    ]);
  });

  afterEach(async () => {
    await orm.close();
  });
});

async function seed(orm: MikroORM) {
  const em = orm.em.fork();

  const school1 = School.create({
    id: SchoolId.create(),
    name: 'School 1',
    timeZone: TimeZone.create('Europe/Moscow'),
    now: DateTime.fromISO('2023-02-05T19:48:34', {
      zone: 'Europe/Moscow',
    }),
  });

  const school2 = School.create({
    id: SchoolId.create(),
    name: 'School 2',
    timeZone: TimeZone.create('Europe/London'),
    now: DateTime.fromISO('2023-02-07T10:12:56', {
      zone: 'Europe/London',
    }),
  });

  await em.persistAndFlush([school1, school2]);

  return {
    school1,
    school2,
  };
}
