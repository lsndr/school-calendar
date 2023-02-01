import { VisitsService } from './visits.service';
import { Test } from '@nestjs/testing';
import { TimeIntervalDto } from './time-interval.dto';
import { Client, ClientId, Office, OfficeId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { WeeklyRecurrenceDto } from './weekly-recurrence.dto';
import { testMikroormProvider } from '../../../../../test-utils';

describe('Visits Service', () => {
  let visitsService: VisitsService;
  let office: Office;
  let client: Client;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [VisitsService, testMikroormProvider],
    }).compile();

    visitsService = moduleRef.get(VisitsService);
    orm = moduleRef.get(MikroORM);
  });

  beforeEach(async () => {
    const id = OfficeId.create();

    office = Office.create({
      id,
      name: 'Office Name',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });

    const officeRepository = orm.em.fork().getRepository(Office);
    await officeRepository.persistAndFlush(office);
  });

  beforeEach(async () => {
    const id = ClientId.create();
    client = Client.create({
      id,
      name: 'Client Name',
      office: office,
      now: DateTime.now(),
    });

    const clientRepository = orm.em.fork().getRepository(Client);
    await clientRepository.persistAndFlush(client);
  });

  it('should create a visit with weekly periodicity', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const knex = orm.em.getConnection().getKnex();

    const result = await visitsService.create(client.officeId.value, {
      name: 'Test Visit',
      recurrence: new WeeklyRecurrenceDto({
        days: [0, 2, 3],
      }),
      time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
      clientId: client.id.value,
      requiredEmployees: 3,
    });

    const result2 = await visitsService.findOne(result.id);
    const logs = await knex.select('*').from('visit_log');

    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Visit',
      recurrence: expect.objectContaining({
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
      recurrence: expect.objectContaining({
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
        recurrence_type: 'weekly',
        recurrence_days: [0, 2, 3],
        recurrence_week1: null,
        recurrence_week2: null,
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
        recurrence: new WeeklyRecurrenceDto({
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
    await orm.close();
  });
});
