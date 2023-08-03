import { Test } from '@nestjs/testing';
import { School, SchoolId, TimeZone } from '../../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '@shared/tests';
import { CqrsModule, CommandBus, QueryBus } from '@shared/cqrs';
import {
  CreateGroupCommand,
  CreateGroupCommandHandler,
} from '../commands/create-group.command';
import { FindGroupsQuery, FindGroupsQueryHandler } from './find-groups.query';
import { CreateGroupDto } from '../dtos/create-group.dto';

describe('FindGroupsQuery', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateGroupCommandHandler,
        FindGroupsQueryHandler,
        testMikroormProvider,
      ],
    }).compile();

    commandBus = moduleRef.get(CommandBus);
    queryBus = moduleRef.get(QueryBus);
    orm = moduleRef.get(MikroORM);

    await moduleRef.createNestApplication().init();
  });

  it('should find groups', async () => {
    // arrange
    const school1 = await seedSchool(orm);
    const school2 = await seedSchool(orm);

    await commandBus.execute(
      new CreateGroupCommand({
        schoolId: school1.id.value,
        payload: {
          name: 'Group 11',
        },
      }),
    );
    await commandBus.execute(
      new CreateGroupCommand({
        schoolId: school1.id.value,
        payload: new CreateGroupDto({
          name: 'Group 12',
        }),
      }),
    );
    await commandBus.execute(
      new CreateGroupCommand({
        schoolId: school2.id.value,
        payload: new CreateGroupDto({
          name: 'Group 21',
        }),
      }),
    );

    // act
    const result = await queryBus.execute(
      new FindGroupsQuery({ schoolId: school1.id.value }),
    );

    // assert
    expect(result).toEqual([
      {
        id: expect.any(String),
        name: 'Group 11',
      },
      {
        id: expect.any(String),
        name: 'Group 12',
      },
    ]);
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
