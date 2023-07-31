import { Test } from '@nestjs/testing';
import { School, SchoolId, TimeZone } from '../../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../shared/tests';
import { CommandBus, CqrsModule, QueryBus } from '../../../../shared/cqrs';
import {
  CreateTeacherCommand,
  CreateTeacherCommandHandler,
} from '../commands/create-teacher.command';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import {
  FindTeachersQuery,
  FindTeachersQueryHandler,
} from './find-teachers.query';

describe('FindTeachersQuery', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        FindTeachersQueryHandler,
        CreateTeacherCommandHandler,
        testMikroormProvider,
      ],
    }).compile();

    queryBus = moduleRef.get(QueryBus);
    commandBus = moduleRef.get(CommandBus);
    orm = moduleRef.get(MikroORM);

    await moduleRef.createNestApplication().init();
  });

  it('should find teachers', async () => {
    // arrange
    const school1 = await seedSchool(orm);
    const school2 = await seedSchool(orm);

    await commandBus.execute(
      new CreateTeacherCommand({
        schoolId: school1.id.value,
        payload: new CreateTeacherDto({
          name: 'Teacher 11',
        }),
      }),
    );

    await commandBus.execute(
      new CreateTeacherCommand({
        schoolId: school1.id.value,
        payload: new CreateTeacherDto({
          name: 'Teacher 12',
        }),
      }),
    );

    await commandBus.execute(
      new CreateTeacherCommand({
        schoolId: school2.id.value,
        payload: new CreateTeacherDto({
          name: 'Teacher 21',
        }),
      }),
    );

    // act
    const result = await queryBus.execute(
      new FindTeachersQuery({ schoolId: school1.id.value }),
    );

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
  const id = SchoolId.create();

  const school = School.create({
    id,
    name: 'School Name',
    timeZone: TimeZone.create('Europe/Moscow'),
    now: DateTime.now(),
  });

  const schoolRepository = orm.em.fork().getRepository(School);
  await schoolRepository.persistAndFlush(school);

  return school;
}
