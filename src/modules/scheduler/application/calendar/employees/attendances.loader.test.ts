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
  Attendance,
  AttendanceId,
  Client,
  ClientId,
  DailyPeriodicity,
  ExactDate,
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
  AttendanceRepository,
  ClientRepository,
  OfficeRepository,
  VisitRepository,
} from '../../../database';
import { AttendancesLoader } from './attendances.loader';

describe('AttendancesLoader', () => {
  let loader: AttendancesLoader;
  let office: Office;
  let knex: Knex;
  let uow: Uow;

  let visit1: Visit;
  let visit2: Visit;
  let client: Client;

  let attendace1: Attendance;
  let attendace2: Attendance;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [AttendancesLoader, knexProvider, uowProvider],
    }).compile();

    loader = moduleRef.get(AttendancesLoader);
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
      const attendanceRepository = ctx.getRepository(AttendanceRepository);

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
        timeInterval: TimeInterval.create({
          startsAt: 720,
          duration: 60,
        }),
        client,
        requiredEmployees: RequiredEmployees.create(2),
        now: now.minus({ days: 2 }),
      });

      visit2 = Visit.create({
        id: VisitId.create(),
        office,
        name: 'Visit 2',
        periodicity: WeeklyPeriodicity.create([0, 4]),
        timeInterval: TimeInterval.create({
          startsAt: 960,
          duration: 120,
        }),
        client,
        requiredEmployees: RequiredEmployees.create(1),
        now: now.minus({ weeks: 4 }),
      });

      attendace1 = Attendance.create({
        id: AttendanceId.create(
          visit1.id,
          ExactDate.create({
            day: 26,
            month: 1,
            year: 2023,
          }),
        ),
        timeInterval: visit1.timeInterval,
        office,
        now,
      });

      attendace2 = Attendance.create({
        id: AttendanceId.create(
          visit2.id,
          ExactDate.create({
            day: 28,
            month: 1,
            year: 2023,
          }),
        ),
        timeInterval: TimeInterval.create({
          startsAt: 0,
          duration: 120,
        }),
        office,
        now,
      });

      officeRepository.add(office);
      clientRepository.add(client);
      visitRepository.add(visit1);
      visitRepository.add(visit2);
      attendanceRepository.add(attendace1);
      attendanceRepository.add(attendace2);
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
      visit.setTimeInterval(
        TimeInterval.create({
          startsAt: 120,
          duration: 600,
        }),
        now,
      );
    });
  });

  it('should load visit 1 since visit 1 version 2 starts later', async () => {
    const attendances = await loader.load({
      timeZone: 'Europe/Moscow',
      officeId: visit1.officeId.value,
      from: DateTime.fromISO('2023-01-26T00:00:00', {
        zone: 'Europe/Moscow',
      }),
      to: DateTime.fromISO('2023-01-29T00:00:00', {
        zone: 'Europe/Moscow',
      }),
    });

    expect(Array.from(attendances)).toEqual([
      {
        date: DateTime.fromISO('2023-01-26T00:00:00', {
          zone: 'Europe/Moscow',
        }),
        duration: 60,
        employeeIds: null,
        startsAt: 720,
        visitId: visit1.id.value,
      },
      {
        date: DateTime.fromISO('2023-01-28T00:00:00', {
          zone: 'Europe/Moscow',
        }),
        duration: 120,
        employeeIds: null,
        startsAt: 0,
        visitId: visit2.id.value,
      },
    ]);
  });

  afterAll(async () => {
    await knex.destroy();
  });
});
