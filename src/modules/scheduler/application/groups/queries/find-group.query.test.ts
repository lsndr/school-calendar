import { Test } from '@nestjs/testing';
import { School, SchoolId, TimeZone } from '../../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '@shared/tests';
import { CqrsModule, CommandBus, QueryBus } from '@shared/cqrs';
import { FindGroupQuery, FindGroupQueryHandler } from './find-group.query';
import {
  CreateGroupCommand,
  CreateGroupCommandHandler,
} from '../commands/create-group.command';
import { CreateGroupDto } from '../dtos/create-group.dto';

describe('FindGroupQuery', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateGroupCommandHandler,
        FindGroupQueryHandler,
        testMikroormProvider,
      ],
    }).compile();

    commandBus = moduleRef.get(CommandBus);
    queryBus = moduleRef.get(QueryBus);
    orm = moduleRef.get(MikroORM);

    await moduleRef.createNestApplication().init();
  });

  it('should find a group', async () => {
    // arrange
    const school = await seedSchool(orm);

    await commandBus.execute(
      new CreateGroupCommand({
        schoolId: school.id.value,
        payload: new CreateGroupDto({
          name: 'Group 1',
        }),
      }),
    );
    const result = await commandBus.execute(
      new CreateGroupCommand({
        schoolId: school.id.value,
        payload: new CreateGroupDto({
          name: 'Group 2',
        }),
      }),
    );

    // act
    const result2 = await queryBus.execute(
      new FindGroupQuery({ schoolId: school.id.value, id: result.id }),
    );

    // assert
    expect(result2).toEqual({
      id: expect.any(String),
      name: 'Group 2',
    });
  });

  afterEach(async () => {
    await orm.close();
  });
});

async function seedSchool(orm: MikroORM) {
  const oschool = School.create({
    id: SchoolId.create(),
    name: 'Test School',
    timeZone: TimeZone.create('Europe/Moscow'),
    now: DateTime.now(),
  });

  const oschoolRepository = orm.em.fork();
  await oschoolRepository.persistAndFlush(oschool);

  return oschool;
}
