import { GroupsService } from './groups.service';
import { Test } from '@nestjs/testing';
import { School, SchoolId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../shared/tests';
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

    const result = await groupsService.create(school.id.value, {
      name: 'Test Group',
    });

    const result2 = await groupsService.findOne(school.id.value, result.id);

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Group',
    });
  });

  it('should find a group', async () => {
    const school = await seedSchool(orm);

    await groupsService.create(school.id.value, {
      name: 'Group 1',
    });
    const result = await groupsService.create(school.id.value, {
      name: 'Group 2',
    });

    const result2 = await groupsService.findOne(school.id.value, result.id);

    expect(result2).toEqual({
      id: expect.any(String),
      name: 'Group 2',
    });
  });

  it('should fail to create a group if school not found', async () => {
    const result = () =>
      groupsService.create(
        'wrong-school-id',
        new CreateGroupDto({
          name: 'Test Group',
        }),
      );

    await expect(result).rejects.toThrowError('School not found');
  });

  it('should fail to create a group if school not found', async () => {
    const result = groupsService.create(
      'wrong-school-id',
      new CreateGroupDto({
        name: 'Test Group',
      }),
    );

    await expect(result).rejects.toThrowError('School not found');
  });

  it('should find groups', async () => {
    const school1 = await seedSchool(orm);
    const school2 = await seedSchool(orm);

    await groupsService.create(school1.id.value, {
      name: 'Group 11',
    });
    await groupsService.create(school1.id.value, {
      name: 'Group 12',
    });
    await groupsService.create(school2.id.value, {
      name: 'Group 21',
    });

    const result = await groupsService.findMany(school1.id.value);

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
