import { VisitsService } from './visits.service';
import { Test } from '@nestjs/testing';
import {
  knexProvider,
  uowProvider,
  KNEX_PROVIDER,
  UOW_PROVIDER,
} from '../../../shared/database';
import { Knex } from 'knex';
import { recreateDb } from '../../../../../test-utils';
import { TimeIntervalDto } from './time-interval.dto';
import { Client, ClientId, Office, OfficeId, TimeZone } from '../../domain';
import { Uow } from 'yuow';
import { ClientRepository, OfficeRepository } from '../../database';
import { WeeklyPeriodicityDto } from './weekly-periodicity.dto';
import { DateTime } from 'luxon';

describe('Employees Service', () => {
  let visitsService: VisitsService;
  let office: Office;
  let client: Client;
  let knex: Knex;
  let uow: Uow;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [VisitsService, knexProvider, uowProvider],
    }).compile();

    visitsService = moduleRef.get(VisitsService);
    knex = moduleRef.get(KNEX_PROVIDER);
    uow = moduleRef.get(UOW_PROVIDER);
  });

  beforeEach(async () => {
    await recreateDb(knex);
  });

  beforeEach(async () => {
    const id = OfficeId.create();

    office = Office.create({
      id,
      name: 'Office Name',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });

    await uow((ctx) => {
      const officeRepository = ctx.getRepository(OfficeRepository);
      officeRepository.add(office);
    });
  });

  beforeEach(async () => {
    const id = ClientId.create();
    client = Client.create({
      id,
      name: 'Client Name',
      office: office,
      now: DateTime.now(),
    });

    await uow((ctx) => {
      const clientRepository = ctx.getRepository(ClientRepository);
      clientRepository.add(client);
    });
  });

  it('should create a visit with weekly periodicity', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const result = await visitsService.create(client.officeId.value, {
      name: 'Test Visit',
      periodicity: new WeeklyPeriodicityDto({
        days: [0, 2, 3],
      }),
      time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
      clientId: client.id.value,
      requiredEmployees: 3,
    });

    const result2 = await visitsService.findOne(result.id);
    const logs = await knex.select('*').from('visits_log');

    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Visit',
      periodicity: expect.objectContaining({
        type: 'weekly',
        days: [0, 2, 3],
      }),
      time: expect.objectContaining({
        startsAt: 0,
        duration: 120,
      }),
      requiredEmployees: 3,
      clientId: client.id.value,
      createdAt: '2023-01-22T12:48:38.529+00:00',
      updatedAt: '2023-01-22T12:48:38.529+00:00',
    });
    expect(result2).toEqual({
      id: result.id,
      name: 'Test Visit',
      clientId: client.id.value,
      periodicity: expect.objectContaining({
        type: 'weekly',
        days: [0, 2, 3],
      }),
      time: expect.objectContaining({
        startsAt: 0,
        duration: 120,
      }),
      requiredEmployees: 3,
      createdAt: '2023-01-22T12:48:38.529+00:00',
      updatedAt: '2023-01-22T12:48:38.529+00:00',
    });
    expect(logs).toEqual([
      {
        visit_id: result.id,
        name: 'Test Visit',
        periodicity_type: 'weekly',
        periodicity_data: {
          type: 'weekly',
          days: [0, 2, 3],
        },
        time_starts_at: 0,
        time_duration: 120,
        required_employees: 3,
        created_at: DateTime.fromISO('2023-01-22T12:48:38.529Z'),
      },
    ]);

    jest.useRealTimers();
  });

  it('should fail to create a visit if office not found', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const act = () =>
      visitsService.create('wrong office id', {
        name: 'Test Visit',
        periodicity: new WeeklyPeriodicityDto({
          days: [0, 2, 3],
        }),
        time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
        clientId: client.id.value,
        requiredEmployees: 3,
      });

    await expect(act).rejects.toThrowError('Office not found');

    jest.useRealTimers();
  });

  afterAll(async () => {
    await knex.destroy();
  });
});
