import { MikroORM } from '@mikro-orm/postgresql';
import { Test } from '@nestjs/testing';
import { DateTime } from 'luxon';
import { testMikroormProvider } from '../../../../../test-utils';
import {
  Client,
  ClientId,
  DailyRecurrence,
  Employee,
  EmployeeId,
  Office,
  OfficeId,
  RequiredEmployees,
  TimeInterval,
  TimeZone,
  Visit,
  VisitId,
  WeeklyRecurrence,
} from '../../domain';
import { AttendancesLoader } from './attendances.loader';
import { EmployeesCalendarLoader } from './employees-calendar.loader';
import { EmployeesCalendarQueryDto } from './employees-calendar.query.dto';
import { EmployeesCalendarService } from './employees-calendar.service';
import { VisitVersionsLoader } from './visit-versions.loader';

describe('EmployeesCalendarService', () => {
  let service: EmployeesCalendarService;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [
        EmployeesCalendarService,
        EmployeesCalendarLoader,
        VisitVersionsLoader,
        AttendancesLoader,
        testMikroormProvider,
      ],
    }).compile();

    service = moduleRef.get(EmployeesCalendarService);
    orm = moduleRef.get(MikroORM);
  });

  afterAll(async () => {
    await orm.close();
  });

  describe('Day', () => {
    it('should properly load events for 2023-01-02', async () => {
      const { office1, dailyVisit1, employee1 } = await seedDay(orm);

      const result = await service.getForPeriod(
        office1.id.value,
        new EmployeesCalendarQueryDto({
          startDate: '2023-01-02',
          days: 1,
        }),
      );

      expect(result).toEqual({
        employees: [
          {
            id: employee1.id.value,
            name: 'Employee 1',
          },
        ],
        events: [
          {
            assignedEmployees: 0,
            duration: 120,
            name: 'Daily Visit 1',
            requiredEmployees: 3,
            startsAt: '2023-01-02T16:00:00.000+03:00',
            visitId: dailyVisit1.id.value,
          },
          {
            assignedEmployees: 0,
            duration: 120,
            name: 'Daily Visit 1',
            requiredEmployees: 3,
            startsAt: '2023-01-02T16:00:00.000+03:00',
            visitId: dailyVisit1.id.value,
          },
          {
            assignedEmployees: 0,
            duration: 120,
            name: 'Daily Visit 1',
            requiredEmployees: 3,
            startsAt: '2023-01-02T16:00:00.000+03:00',
            visitId: dailyVisit1.id.value,
          },
        ],
      });
    });

    it('should properly load events for 2023-01-09', async () => {
      const { office1, dailyVisit1, weeklyVisit1, employee1 } = await seedDay(
        orm,
      );

      const result = await service.getForPeriod(
        office1.id.value,
        new EmployeesCalendarQueryDto({
          startDate: '2023-01-09',
          days: 1,
        }),
      );

      expect(result).toEqual({
        employees: [
          {
            id: employee1.id.value,
            name: 'Employee 1',
          },
        ],
        events: [
          {
            assignedEmployees: 0,
            duration: 120,
            employeeId: undefined,
            name: 'Weekly Visit 1',
            requiredEmployees: 1,
            startsAt: '2023-01-09T16:00:00.000+03:00',
            visitId: weeklyVisit1.id.value,
          },
          {
            assignedEmployees: 0,
            duration: 120,
            employeeId: undefined,
            name: 'Daily Visit 1',
            requiredEmployees: 3,
            startsAt: '2023-01-09T16:00:00.000+03:00',
            visitId: dailyVisit1.id.value,
          },
          {
            assignedEmployees: 0,
            duration: 120,
            employeeId: undefined,
            name: 'Daily Visit 1',
            requiredEmployees: 3,
            startsAt: '2023-01-09T16:00:00.000+03:00',
            visitId: dailyVisit1.id.value,
          },
          {
            assignedEmployees: 0,
            duration: 120,
            employeeId: undefined,
            name: 'Daily Visit 1',
            requiredEmployees: 3,
            startsAt: '2023-01-09T16:00:00.000+03:00',
            visitId: dailyVisit1.id.value,
          },
        ],
      });
    });
  });
});

async function seedDay(orm: MikroORM) {
  const em = orm.em.fork();

  const office1 = Office.create({
    id: OfficeId.create(),
    name: 'Office 1',
    now: DateTime.fromISO('2022-12-05T09:12:56', {
      zone: 'Europe/Moscow',
    }),
    timeZone: TimeZone.create('Europe/Moscow'),
  });

  const client1 = Client.create({
    id: ClientId.create(),
    office: office1,
    name: 'Client 1',
    now: DateTime.fromISO('2022-12-05T09:23:12', {
      zone: 'Europe/Moscow',
    }),
  });

  const employee1 = Employee.create({
    id: EmployeeId.create(),
    office: office1,
    name: 'Employee 1',
    now: DateTime.fromISO('2022-12-05T09:25:09', {
      zone: 'Europe/Moscow',
    }),
  });

  const dailyVisit1 = Visit.create({
    id: VisitId.create(),
    name: 'Daily Visit 1',
    office: office1,
    client: client1,
    recurrence: DailyRecurrence.create(),
    time: TimeInterval.create({
      startsAt: 960,
      duration: 120,
    }),
    requiredEmployees: RequiredEmployees.create(3),
    now: DateTime.fromISO('2022-12-05T12:04:04', {
      zone: 'Europe/Moscow',
    }),
  });

  const weeklyVisit1 = Visit.create({
    id: VisitId.create(),
    name: 'Weekly Visit 1',
    office: office1,
    client: client1,
    recurrence: WeeklyRecurrence.create([0]),
    time: TimeInterval.create({
      startsAt: 960,
      duration: 120,
    }),
    requiredEmployees: RequiredEmployees.create(1),
    now: DateTime.fromISO('2023-01-03T13:00:00', {
      zone: 'Europe/Moscow',
    }),
  });

  em.persist(office1);
  em.persist(client1);
  em.persist(employee1);
  em.persist(dailyVisit1);
  em.persist(weeklyVisit1);

  await em.flush();

  return {
    office1,
    client1,
    employee1,
    dailyVisit1,
    weeklyVisit1,
  };
}
