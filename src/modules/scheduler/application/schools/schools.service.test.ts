import { SchoolsService } from './schools.service';
import { Test } from '@nestjs/testing';
import {
  knexProvider,
  uowProvider,
  KNEX_PROVIDER,
} from '../../../shared/database';
import { Knex } from 'knex';
import { recreateDb } from '../../../../../test-utils';

describe('Schools Service', () => {
  let schoolsService: SchoolsService;
  let knex: Knex;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [SchoolsService, knexProvider, uowProvider],
    }).compile();

    schoolsService = moduleRef.get(SchoolsService);
    knex = moduleRef.get(KNEX_PROVIDER);
  });

  beforeEach(async () => {
    await recreateDb(knex);
  });

  it('should create an school', async () => {
    const result = await schoolsService.create({
      name: 'Test School',
      timeZone: 'Europe/Moscow',
    });

    const result2 = await schoolsService.findOne(result.id);

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test School',
      timeZone: 'Europe/Moscow',
    });
  });

  afterAll(async () => {
    await knex.destroy();
  });
});
