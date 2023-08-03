import { Test } from '@nestjs/testing';
import { School, SchoolId, TimeZone } from '../../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '@shared/tests';
import { CommandBus, QueryBus, CqrsModule } from '@shared/cqrs';
import {
  CreateGroupCommand,
  CreateGroupCommandHandler,
} from './create-group.command';
import {
  FindGroupQuery,
  FindGroupQueryHandler,
} from '../queries/find-group.query';
import { CreateGroupDto } from '../dtos/create-group.dto';

describe('CreateGroupCommand', () => {
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

  it('should create a group', async () => {
    // arrange
    const school = await seedSchool(orm);

    // act
    const result = await commandBus.execute(
      new CreateGroupCommand({
        schoolId: school.id.value,
        payload: new CreateGroupDto({
          name: 'Test Group',
        }),
      }),
    );

    // assert
    const result2 = await queryBus.execute(
      new FindGroupQuery({ schoolId: school.id.value, id: result.id }),
    );

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Group',
    });
  });

  it('should fail to create a group if school not found', async () => {
    // act
    const result = () =>
      commandBus.execute(
        new CreateGroupCommand({
          schoolId: 'wrong-school-id',
          payload: new CreateGroupDto({
            name: 'Test Group',
          }),
        }),
      );

    // assert
    await expect(result).rejects.toThrowError('School not found');
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
