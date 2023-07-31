import { Test } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../shared/tests';
import { CommandBus, QueryBus, CqrsModule } from '../../../../shared/cqrs';
import {
  CreateSchoolCommand,
  CreateSchoolCommandHandler,
} from './create-school.command';
import { CreateSchoolDto } from '../dtos/create-school.dto';
import {
  FindSchoolQuery,
  FindSchoolQueryHandler,
} from '../queries/find-school.query';

describe('CreateSchoolCommand', () => {
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateSchoolCommandHandler,
        FindSchoolQueryHandler,
        testMikroormProvider,
      ],
    }).compile();

    commandBus = moduleRef.get(CommandBus);
    queryBus = moduleRef.get(QueryBus);
    orm = moduleRef.get(MikroORM);

    await moduleRef.createNestApplication().init();
  });

  it('should create a school', async () => {
    // arrange
    const result = await commandBus.execute(
      new CreateSchoolCommand({
        payload: new CreateSchoolDto({
          name: 'Test School',
          timeZone: 'Europe/Moscow',
        }),
      }),
    );

    // act
    const result2 = await queryBus.execute(
      new FindSchoolQuery({ id: result.id }),
    );

    // assert
    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test School',
      timeZone: 'Europe/Moscow',
    });
  });

  afterEach(async () => {
    await orm.close();
  });
});
