import { Test } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '@shared/tests';
import { CommandBus, QueryBus, CqrsModule } from '@shared/cqrs';
import { School, SchoolId, TimeZone } from '../../../domain';
import { DateTime } from 'luxon';
import {
  CreateTeacherCommand,
  CreateTeacherCommandHandler,
} from './create-teacher.command';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import {
  FindTeacherQuery,
  FindTeacherQueryHandler,
} from '../queries/find-teacher.query';

describe('CreateTeacherCommand', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateTeacherCommandHandler,
        FindTeacherQueryHandler,
        testMikroormProvider,
      ],
    }).compile();

    commandBus = moduleRef.get(CommandBus);
    queryBus = moduleRef.get(QueryBus);
    orm = moduleRef.get(MikroORM);

    await moduleRef.createNestApplication().init();
  });

  it('should create an teacher', async () => {
    // arrange
    const school = await seedSchool(orm);

    // act
    const result = await commandBus.execute(
      new CreateTeacherCommand({
        schoolId: school.id.value,
        payload: new CreateTeacherDto({
          name: 'Test Teacher',
        }),
      }),
    );

    const result2 = await queryBus.execute(
      new FindTeacherQuery({
        schoolId: school.id.value,
        id: result.id,
      }),
    );

    // assert
    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Teacher',
    });
  });

  it('should fail to create an teacher if school not found', async () => {
    // act
    const act = () =>
      commandBus.execute(
        new CreateTeacherCommand({
          schoolId: 'wrong-school-id',
          payload: new CreateTeacherDto({
            name: 'Test Teacher',
          }),
        }),
      );

    // assert
    await expect(act).rejects.toThrowError('School not found');
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
