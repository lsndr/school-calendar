import { Test } from '@nestjs/testing';
import {
  Attendance,
  AttendanceId,
  Client,
  ClientId,
  DailyRecurrence,
  ExactDate,
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
import { AttendancesLoader } from './attendances.loader';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../../../test-utils';
import { MIKROORM_PROVIDER } from '../../../../shared/database';

describe('AttendancesLoader', () => {
  let loader: AttendancesLoader;
  let office: Office;
  let orm: MikroORM;

  let visit1: Visit;
  let visit2: Visit;
  let client: Client;

  let attendace1: Attendance;
  let attendace2: Attendance;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AttendancesLoader, testMikroormProvider],
    }).compile();

    loader = moduleRef.get(AttendancesLoader);
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
    const attendanceRepository = em.getRepository(Attendance);

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

    visit2 = Visit.create({
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

    attendace1 = Attendance.create({
      id: AttendanceId.create(),
      visit: visit1,
      date: ExactDate.create({
        day: 26,
        month: 1,
        year: 2023,
      }),
      time: visit1.time,
      office,
      now,
    });

    attendace2 = Attendance.create({
      id: AttendanceId.create(),
      visit: visit2,
      date: ExactDate.create({
        day: 28,
        month: 1,
        year: 2023,
      }),
      time: TimeInterval.create({
        startsAt: 0,
        duration: 120,
      }),
      office,
      now,
    });

    officeRepository.persist(office);
    clientRepository.persist(client);
    visitRepository.persist(visit1);
    visitRepository.persist(visit2);
    attendanceRepository.persist(attendace1);
    attendanceRepository.persist(attendace2);

    await em.flush();
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
    await orm.close();
  });
});
