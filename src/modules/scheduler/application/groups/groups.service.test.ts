import { GroupsService } from './groups.service';
import { Test } from '@nestjs/testing';
import { School, SchoolId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../../test-utils';
import { CreateGroupDto } from './create-group.dto';

describe('Groups Service', () => {
  let groupsService: GroupsService;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [GroupsService, testMikroormProvider],
    }).compile();

    groupsService = moduleRef.get(GroupsService);
    orm = moduleRef.get(MikroORM);
  });

  it('should create a group', async () => {
    const school = await seedSchool(orm);

    const result = await groupsService.create(
      new CreateGroupDto({
        name: 'Test Group',
        schoolId: school.id.value,
      }),
    );

    const result2 = await groupsService.findOne(school.id.value, result.id);

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

  it('should fail to create a group if school not found', async () => {
    const result = () =>
      groupsService.create(
        new CreateGroupDto({
          name: 'Test group',
          schoolId: 'wrong-school-id',
        }),
      );

    await expect(result).rejects.toThrowError('School not found');
  });

  it('should find groups', async () => {
    const school1 = await seedSchool(orm);
    const school2 = await seedSchool(orm);

    await groupsService.create({
      name: 'group 11',
      schoolId: school1.id.value,
    });
    await groupsService.create({
      name: 'group 12',
      schoolId: school1.id.value,
    });
    await groupsService.create({
      name: 'group 21',
      schoolId: school2.id.value,
    });

    const result = await groupsService.findMany(school1.id.value);

    expect(result).toEqual([
      {
        id: expect.any(String),
        name: 'group 11',
      },
      {
        id: expect.any(String),
        name: 'group 12',
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
