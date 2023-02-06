import { TeachersService } from './teachers.service';
import { Test } from '@nestjs/testing';
import { School, SchoolId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../../test-utils';
import { CreateTeacherDto } from './create-teacher.dto';

describe('Teachers Service', () => {
  let teachersService: TeachersService;
  let school: School;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [TeachersService, testMikroormProvider],
    }).compile();

    teachersService = moduleRef.get(TeachersService);
    orm = moduleRef.get(MikroORM);
  });

  beforeEach(async () => {
    school = School.create({
      id: SchoolId.create(),
      name: 'Test School',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });

    const schoolRepository = orm.em.fork().getRepository(School);
    await schoolRepository.persistAndFlush(school);
  });

  it('should create an teacher', async () => {
    const result = await teachersService.create(
      school.id.value,
      new CreateTeacherDto({
        name: 'Test Teacher',
      }),
    );

    const result2 = await teachersService.findOne(result.id);

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

  afterAll(async () => {
    await orm.close();
  });
});
