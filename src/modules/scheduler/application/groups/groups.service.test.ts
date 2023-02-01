import { GroupsService } from './groups.service';
import { Test } from '@nestjs/testing';
import { School, SchoolId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../../test-utils';
import { CreateGroupDto } from './create-group.dto';

describe('Groups Service', () => {
  let groupsService: GroupsService;
  let school: School;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [GroupsService, testMikroormProvider],
    }).compile();

    groupsService = moduleRef.get(GroupsService);
    orm = moduleRef.get(MikroORM);
  });

  beforeEach(async () => {
    school = School.create({
      id: SchoolId.create(),
      name: 'Test School',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });

    const schoolRepository = orm.em.fork();
    await schoolRepository.persistAndFlush(school);
  });

  it('should create a group', async () => {
    const result = await groupsService.create(
      new CreateGroupDto({
        name: 'Test Group',
        schoolId: school.id.value,
      }),
    );

    const result2 = await groupsService.findOne(result.id);

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Group',
    });
  });

  it('should fail to create a group if school not found', async () => {
    const result = () =>
      groupsService.create(
        new CreateGroupDto({
          name: 'Test Group',
          schoolId: 'wrong-school-id',
        }),
      );

    await expect(result).rejects.toThrowError('School not found');
  });

  afterAll(async () => {
    await orm.close();
  });
});
