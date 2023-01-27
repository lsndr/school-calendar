import { GroupsService } from './groups.service';
import { Test } from '@nestjs/testing';
import {
  knexProvider,
  uowProvider,
  KNEX_PROVIDER,
  UOW_PROVIDER,
} from '../../../shared/database';
import { Knex } from 'knex';
import { recreateDb } from '../../../../../test-utils';
import { School, SchoolId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { Uow } from 'yuow';
import { SchoolRepository } from '../../database';

describe('Groups Service', () => {
  let groupsService: GroupsService;
  let school: School;
  let knex: Knex;
  let uow: Uow;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [GroupsService, knexProvider, uowProvider],
    }).compile();

    groupsService = moduleRef.get(GroupsService);
    knex = moduleRef.get(KNEX_PROVIDER);
    uow = moduleRef.get(UOW_PROVIDER);
  });

  beforeEach(async () => {
    await recreateDb(knex);
  });

  beforeEach(async () => {
    school = School.create({
      id: SchoolId.create(),
      name: 'Test School',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });

    await uow(async (ctx) => {
      const schoolRepository = ctx.getRepository(SchoolRepository);
      schoolRepository.add(school);
    });
  });

  it('should create a group', async () => {
    const result = await groupsService.create({
      name: 'Test Group',
      schoolId: school.id.value,
    });

    const result2 = await groupsService.findOne(result.id);

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Group',
    });
  });

  it('should fail to create a group if school not found', async () => {
    const result = () =>
      groupsService.create({
        name: 'Test Group',
        schoolId: 'wrong-school-id',
      });

    await expect(result).rejects.toThrowError('School not found');
  });

  afterAll(async () => {
    await knex.destroy();
  });
});
