import { TeachersService } from './teachers.service';
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
import { Uow } from 'yuow';
import { DateTime } from 'luxon';
import { SchoolRepository } from '../../database';

describe('Teachers Service', () => {
  let teachersService: TeachersService;
  let school: School;
  let knex: Knex;
  let uow: Uow;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [TeachersService, knexProvider, uowProvider],
    }).compile();

    teachersService = moduleRef.get(TeachersService);
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

  it('should create an teacher', async () => {
    const result = await teachersService.create({
      name: 'Test Teacher',
      schoolId: school.id.value,
    });

    const result2 = await teachersService.findOne(result.id);

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Teacher',
    });
  });

  it('should fail to create an teacher if school not found', async () => {
    const result = () =>
      teachersService.create({
        name: 'Test Group',
        schoolId: 'wrong-school-id',
      });

    await expect(result).rejects.toThrowError('School not found');
  });

  afterAll(async () => {
    await knex.destroy();
  });
});
