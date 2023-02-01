import { Test } from '@nestjs/testing';
import {
  Client,
  ClientId,
  DailyRecurrence,
  Office,
  OfficeId,
  RequiredEmployees,
  TimeInterval,
  TimeZone,
  Visit,
  VisitId,
  WeeklyRecurrence,
} from '../../../domain';
import { DateTime } from 'luxon';
import { VisitVersionsLoader } from './visit-versions.loader';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../../../test-utils';
import { MIKROORM_PROVIDER } from '../../../../shared/database';

describe('VisitVersionsLoader', () => {
  let loader: VisitVersionsLoader;
  let office: Office;
  let orm: MikroORM;

  let visit1: Visit;
  let client: Client;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [VisitVersionsLoader, testMikroormProvider],
    }).compile();

    loader = moduleRef.get(VisitVersionsLoader);
    orm = moduleRef.get(MIKROORM_PROVIDER);
  });

  beforeAll(async () => {
    const em = orm.em.fork();
    const now = DateTime.fromISO('2023-01-25T11:48:38', {
      zone: 'Europe/Moscow',
    });

    const officeRepository = em.getRepository(Office);
    const clientRepository = em.getRepository(Client);
    const visitRepository = em.getRepository(Visit);

    office = Office.create({
      id: OfficeId.create(),
      name: 'Test Office',
      timeZone: TimeZone.create('Europe/Moscow'),
      now,
    });

    client = Client.create({
      id: ClientId.create(),
      office,
      name: 'Test Client',
      now,
    });

    visit1 = Visit.create({
      id: VisitId.create(),
      office,
      name: 'Visit 1',
      recurrence: DailyRecurrence.create(),
      time: TimeInterval.create({
        startsAt: 720,
        duration: 60,
      }),
      client,
      requiredEmployees: RequiredEmployees.create(2),
      now: now.minus({ days: 2 }),
    });

    const visit2 = Visit.create({
      id: VisitId.create(),
      office,
      name: 'Visit 2',
      recurrence: WeeklyRecurrence.create([0, 4]),
      time: TimeInterval.create({
        startsAt: 960,
        duration: 120,
      }),
      client,
      requiredEmployees: RequiredEmployees.create(1),
      now: now.minus({ weeks: 4 }),
    });

    officeRepository.persist(office);
    clientRepository.persist(client);
    visitRepository.persist(visit1);
    visitRepository.persist(visit2);

    await em.flush();

    const visit = await visitRepository
      .createQueryBuilder()
      .where({
        id: visit1.id.value,
      })
      .getSingleResult();

    if (!visit) {
      throw new Error('Visit Not found');
    }

    visit.setName('Visit 1 Version 2', now);
    visit.setTime(
      TimeInterval.create({
        startsAt: 120,
        duration: 600,
      }),
      now,
    );

    await em.flush();
  });

  it('should load visit 1 since visit 1 version 2 starts later', async () => {
    const visits = await loader.load({
      officeId: office.id.value,
      timeZone: 'Europe/Moscow',
      from: DateTime.fromISO('2023-01-25T00:00:00', {
        zone: 'Europe/Moscow',
      }),
      to: DateTime.fromISO('2023-01-26T00:00:00', {
        zone: 'Europe/Moscow',
      }),
    });

    expect(Array.from(visits)).toEqual([
      {
        clientId: client.id.value,
        date: DateTime.fromISO('2023-01-25T00:00:00', {
          zone: 'Europe/Moscow',
        }),
        duration: 60,
        id: visit1.id.value,
        name: 'Visit 1',
        startsAt: 720,
        requiredEmployees: 2,
      },
    ]);
  });

  it.skip('should properly load week from 2023-01-23 to 2023-01-30T00:00:00', async () => {
    const visits = await loader.load({
      officeId: office.id.value,
      timeZone: 'Europe/Moscow',
      from: DateTime.fromISO('2023-01-23T00:00:00', {
        zone: 'Europe/Moscow',
      }),
      to: DateTime.fromISO('2023-01-30T00:00:00', {
        zone: 'Europe/Moscow',
      }),
    });

    expect(Array.from(visits)).toEqual([]);
  });

  afterAll(async () => {
    await orm.close();
  });
});
