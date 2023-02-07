import { VisitsService } from './visits.service';
import { Test } from '@nestjs/testing';
import { TimeIntervalDto } from './time-interval.dto';
import { Client, ClientId, Office, OfficeId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { WeeklyRecurrenceDto } from './weekly-recurrence.dto';
import { testMikroormProvider } from '../../../../../test-utils';
import { CreateVisitDto } from './create-visit.dto';
import { DailyRecurrenceDto } from './daily-recurrence.dto';
import { MonthlyRecurrenceDto } from './monthly-recurrence.dto';

describe('Visits Service', () => {
  let visitsService: VisitsService;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [VisitsService, testMikroormProvider],
    }).compile();

    visitsService = moduleRef.get(VisitsService);
    orm = moduleRef.get(MikroORM);
  });

  it('should create a visit with weekly periodicity', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const office = await seedOffice(orm);
    const client = await seedClient(office, orm);
    const knex = orm.em.getConnection().getKnex();

    const result = await visitsService.create(
      client.officeId.value,
      new CreateVisitDto({
        name: 'Test Visit',
        recurrence: new WeeklyRecurrenceDto({
          days: [0, 2, 3],
        }),
        time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
        clientId: client.id.value,
        requiredEmployees: 3,
      }),
    );

    const result2 = await visitsService.findOne(office.id.value, result.id);
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

    const office = await seedOffice(orm);
    const client = await seedClient(office, orm);

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

  it('should find offices', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-22T12:48:38.529Z'));

    const office1 = await seedOffice(orm);
    const office2 = await seedOffice(orm);
    const client1 = await seedClient(office1, orm);
    const client2 = await seedClient(office1, orm);
    const client3 = await seedClient(office2, orm);

    await visitsService.create(
      client1.officeId.value,
      new CreateVisitDto({
        name: 'Test Visit 1',
        recurrence: new WeeklyRecurrenceDto({
          days: [0, 2, 3],
        }),
        time: new TimeIntervalDto({ startsAt: 0, duration: 120 }),
        clientId: client1.id.value,
        requiredEmployees: 3,
      }),
    );

    await visitsService.create(
      client2.officeId.value,
      new CreateVisitDto({
        name: 'Test Visit 2',
        recurrence: new MonthlyRecurrenceDto({
          days: [0, 2, 3],
        }),
        time: new TimeIntervalDto({ startsAt: 630, duration: 240 }),
        clientId: client2.id.value,
        requiredEmployees: 2,
      }),
    );

    await visitsService.create(
      client3.officeId.value,
      new CreateVisitDto({
        name: 'Test Visit 3',
        recurrence: new DailyRecurrenceDto(),
        time: new TimeIntervalDto({ startsAt: 400, duration: 200 }),
        clientId: client3.id.value,
        requiredEmployees: 2,
      }),
    );

    const result = await visitsService.findMany(office1.id.value);

    expect(result).toEqual([
      {
        clientId: client1.id.value,
        createdAt: '2023-01-22T12:48:38.529+00:00',
        id: expect.any(String),
        name: 'Test Visit 1',
        recurrence: new WeeklyRecurrenceDto({
          days: [0, 2, 3],
        }),
        requiredEmployees: 3,
        time: new TimeIntervalDto({
          duration: 120,
          startsAt: 0,
        }),
        updatedAt: '2023-01-22T12:48:38.529+00:00',
      },
      {
        clientId: client2.id.value,
        createdAt: '2023-01-22T12:48:38.529+00:00',
        id: expect.any(String),
        name: 'Test Visit 2',
        recurrence: new MonthlyRecurrenceDto({
          days: [0, 2, 3],
        }),
        requiredEmployees: 2,
        time: new TimeIntervalDto({
          duration: 240,
          startsAt: 630,
        }),
        updatedAt: '2023-01-22T12:48:38.529+00:00',
      },
    ]);

    jest.useRealTimers();
  });

  afterEach(async () => {
    await orm.close();
  });
});

async function seedOffice(orm: MikroORM) {
  const id = OfficeId.create();

  const office = Office.create({
    id,
    name: 'Office Name',
    timeZone: TimeZone.create('Europe/Moscow'),
    now: DateTime.now(),
  });

  const officeRepository = orm.em.fork().getRepository(Office);
  await officeRepository.persistAndFlush(office);

  return office;
}

async function seedClient(office: Office, orm: MikroORM) {
  const id = ClientId.create();
  const client = Client.create({
    id,
    name: 'Client Name',
    office: office,
    now: DateTime.now(),
  });

  const clientRepository = orm.em.fork().getRepository(Client);
  await clientRepository.persistAndFlush(client);

  return client;
}
