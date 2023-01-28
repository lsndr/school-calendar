import { Test } from '@nestjs/testing';
import {
  knexProvider,
  KNEX_PROVIDER,
  uowProvider,
  UOW_PROVIDER,
} from '../../../../shared/database';
import { Knex } from 'knex';
import { recreateDb } from '../../../../../../test-utils';
import { Uow } from 'yuow';
import {
  Client,
  ClientId,
  DailyPeriodicity,
  Office,
  OfficeId,
  RequiredEmployees,
  TimeInterval,
  TimeZone,
  Visit,
  VisitId,
  WeeklyPeriodicity,
} from '../../../domain';
import { DateTime } from 'luxon';
import {
  ClientRepository,
  OfficeRepository,
  VisitRepository,
} from '../../../database';
import { VisitVersionsLoader } from './visit-versions.loader';

describe('VisitVersionLoader', () => {
  let loader: VisitVersionsLoader;
  let office: Office;
  let knex: Knex;
  let uow: Uow;

  let visit1: Visit;
  let client: Client;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [VisitVersionsLoader, knexProvider, uowProvider],
    }).compile();

    loader = moduleRef.get(VisitVersionsLoader);
    knex = moduleRef.get(KNEX_PROVIDER);
    uow = moduleRef.get(UOW_PROVIDER);
  });

  beforeAll(async () => {
    await recreateDb(knex);
  });

  beforeAll(async () => {
    const now = DateTime.fromISO('2023-01-25T11:48:38', {
      zone: 'Europe/Moscow',
    });

    await uow((ctx) => {
      const officeRepository = ctx.getRepository(OfficeRepository);
      const clientRepository = ctx.getRepository(ClientRepository);
      const visitRepository = ctx.getRepository(VisitRepository);

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
        periodicity: DailyPeriodicity.create(),
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
        periodicity: WeeklyPeriodicity.create([0, 4]),
        time: TimeInterval.create({
          startsAt: 960,
          duration: 120,
        }),
        client,
        requiredEmployees: RequiredEmployees.create(1),
        now: now.minus({ weeks: 4 }),
      });

      officeRepository.add(office);
      clientRepository.add(client);
      visitRepository.add(visit1);
      visitRepository.add(visit2);
    });

    await uow(async (ctx) => {
      const visitRepository = ctx.getRepository(VisitRepository);

      const visit = await visitRepository.findOne({
        id: visit1.id.value,
      });

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
    });
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
    await knex.destroy();
  });
});
