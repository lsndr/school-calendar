import { SchoolsService } from './schools.service';
import { Test } from '@nestjs/testing';
import { testMikroormProvider } from '../../../../../test-utils';
import { MikroORM } from '@mikro-orm/postgresql';
import { CreateSchoolDto } from './create-school.dto';
import { School, SchoolId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';

describe('Schools Service', () => {
  let schoolsService: SchoolsService;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [SchoolsService, testMikroormProvider],
    }).compile();

    schoolsService = moduleRef.get(SchoolsService);
    orm = moduleRef.get(MikroORM);
  });

  it('should create a school', async () => {
    const result = await schoolsService.create(
      new CreateSchoolDto({
        name: 'Test School',
        timeZone: 'Europe/Moscow',
      }),
    );

    const result2 = await schoolsService.findOne(result.id);

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test School',
      timeZone: 'Europe/Moscow',
    });
  });

  it('should find schools', async () => {
    await seed(orm);

    const result = await schoolsService.findMany();

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
