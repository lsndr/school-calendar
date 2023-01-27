import { OfficesService } from './offices.service';
import { Test } from '@nestjs/testing';
import {
  knexProvider,
  uowProvider,
  KNEX_PROVIDER,
} from '../../../shared/database';
import { Knex } from 'knex';
import { recreateDb } from '../../../../../test-utils';

describe('Offices Service', () => {
  let officesService: OfficesService;
  let knex: Knex;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [OfficesService, knexProvider, uowProvider],
    }).compile();

    officesService = moduleRef.get(OfficesService);
    knex = moduleRef.get(KNEX_PROVIDER);
  });

  beforeEach(async () => {
    await recreateDb(knex);
  });

  it('should create an office', async () => {
    const result = await officesService.create({
      name: 'Test Office',
      timeZone: 'Europe/Moscow',
    });

    const result2 = await officesService.findOne(result.id);

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Office',
      timeZone: 'Europe/Moscow',
    });
  });

  afterAll(async () => {
    await knex.destroy();
  });
});
