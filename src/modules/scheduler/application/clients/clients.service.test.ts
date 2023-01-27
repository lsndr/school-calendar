import { ClientsService } from './clients.service';
import { Test } from '@nestjs/testing';
import {
  knexProvider,
  uowProvider,
  KNEX_PROVIDER,
  UOW_PROVIDER,
} from '../../../shared/database';
import { Knex } from 'knex';
import { recreateDb } from '../../../../../test-utils';
import { Office, OfficeId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { Uow } from 'yuow';
import { OfficeRepository } from '../../database';

describe('Clients Service', () => {
  let clientsService: ClientsService;
  let office: Office;
  let knex: Knex;
  let uow: Uow;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [ClientsService, knexProvider, uowProvider],
    }).compile();

    clientsService = moduleRef.get(ClientsService);
    knex = moduleRef.get(KNEX_PROVIDER);
    uow = moduleRef.get(UOW_PROVIDER);
  });

  beforeEach(async () => {
    await recreateDb(knex);
  });

  beforeEach(async () => {
    office = Office.create({
      id: OfficeId.create(),
      name: 'Test Office',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });

    await uow(async (ctx) => {
      const officeRepository = ctx.getRepository(OfficeRepository);
      officeRepository.add(office);
    });
  });

  it('should create a client', async () => {
    const result = await clientsService.create({
      name: 'Test Client',
      officeId: office.id.value,
    });

    const result2 = await clientsService.findOne(result.id);

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Client',
    });
  });

  it('should fail to create a client if office not found', async () => {
    const result = () =>
      clientsService.create({
        name: 'Test Client',
        officeId: 'wrong-office-id',
      });

    await expect(result).rejects.toThrowError('Office not found');
  });

  afterAll(async () => {
    await knex.destroy();
  });
});
