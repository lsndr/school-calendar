import { TeachersService } from './teachers.service';
import { Test } from '@nestjs/testing';
import { School, SchoolId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../shared/tests';
import { CreateTeacherDto } from './create-teacher.dto';

describe('Teachers Service', () => {
  let teachersService: TeachersService;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [TeachersService, testMikroormProvider],
    }).compile();

    teachersService = moduleRef.get(TeachersService);
    orm = moduleRef.get(MikroORM);
  });

  it('should create an teacher', async () => {
    const school = await seedSchool(orm);

    const result = await teachersService.create(
      school.id.value,
      new CreateTeacherDto({
        name: 'Test Teacher',
      }),
    );

    const result2 = await teachersService.findOne(school.id.value, result.id);

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Teacher',
    });
  });

  it('should fail to create an teacher if school not found', async () => {
    const result = () =>
      teachersService.create(
        'wrong-school-id',
        new CreateTeacherDto({
          name: 'Test Group',
        }),
      );

    await expect(result).rejects.toThrowError('School not found');
  });

  it('should find teachers', async () => {
    const school1 = await seedSchool(orm);
    const school2 = await seedSchool(orm);

    await teachersService.create(school1.id.value, {
      name: 'Teacher 11',
    });
    await teachersService.create(school1.id.value, {
      name: 'Teacher 12',
    });
    await teachersService.create(school2.id.value, {
      name: 'Teacher 21',
    });

    const result = await teachersService.findMany(school1.id.value);

    expect(result).toEqual([
      {
        id: expect.any(String),
        name: 'Teacher 11',
      },
      {
        id: expect.any(String),
        name: 'Teacher 12',
      },
    ]);
  });

  afterEach(async () => {
    await orm.close();
  });
});

async function seedSchool(orm: MikroORM) {
  const school = School.create({
    id: SchoolId.create(),
    name: 'Test School',
    timeZone: TimeZone.create('Europe/Moscow'),
    now: DateTime.now(),
  });

  const schoolRepository = orm.em.fork();
  await schoolRepository.persistAndFlush(school);

  return school;
}
