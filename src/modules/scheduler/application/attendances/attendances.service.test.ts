import { AttendancesService } from './attendances.service';
import { Test } from '@nestjs/testing';
import {
  Attendance,
  AttendanceId,
  Client,
  ClientId,
  Employee,
  EmployeeId,
  ExactDate,
  Office,
  OfficeId,
  RequiredEmployees,
  TimeInterval,
  TimeZone,
  Visit,
  VisitId,
  WeeklyRecurrence,
} from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../../test-utils';
import { CreateAttendanceDto } from './create-attendance.dto';
import { AssignEmployeesDto } from './assign-employees.dto';

describe('Attendances Service', () => {
  let attendancesService: AttendancesService;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [AttendancesService, testMikroormProvider],
    }).compile();

    attendancesService = moduleRef.get(AttendancesService);
    orm = moduleRef.get(MikroORM);
  });

  it('should create an attendance', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-23T14:00:28.460Z'));
    const knex = orm.em.getConnection().getKnex();
    const office = await seedOffice(orm);
    const client = await seedClient(office, orm);
    const visit = await seedVisit(office, client, orm);
    const employee = await seedEmployee(office, orm);

    const result = await attendancesService.create(
      office.id.value,
      visit.id.value,
      new CreateAttendanceDto({
        date: '2023-01-24',
        employeeIds: [employee.id.value],
        time: {
          startsAt: 45,
          duration: 123,
        },
      }),
    );

    const result2 = await attendancesService.findOne(
      office.id.value,
      visit.id.value,
      '2023-01-24',
    );
    const result3 = await knex.select('*').from('outbox');

    expect(result).toEqual({
      date: '2023-01-24',
      visitId: visit.id.value,
      createdAt: '2023-01-23T14:00:28.460+00:00',
      updatedAt: '2023-01-23T14:00:28.460+00:00',
      assignedEmployees: [
        {
          assignedAt: '2023-01-23T14:00:28.460+00:00',
          employeeId: employee.id.value,
        },
      ],
      time: expect.objectContaining({
        duration: 123,
        startsAt: 45,
      }),
    });
    expect(result2).toEqual({
      date: '2023-01-24',
      visitId: visit.id.value,
      createdAt: '2023-01-23T14:00:28.460+00:00',
      updatedAt: '2023-01-23T14:00:28.460+00:00',
      assignedEmployees: [
        {
          assignedAt: '2023-01-23T14:00:28.460+00:00',
          employeeId: employee.id.value,
        },
      ],
      time: expect.objectContaining({
        duration: 123,
        startsAt: 45,
      }),
    });
    expect(result3).toEqual([
      {
        created_at: DateTime.fromISO('2023-01-23T14:00:28.460+00:00'),
        id: expect.any(String),
        payload: {
          createdAt: '2023-01-23T14:00:28.460+00:00',
          employeeIds: [employee.id.value],
          id: {
            date: {
              day: 24,
              month: 1,
              year: 2023,
            },
            visitId: visit.id.value,
          },
          time: {
            duration: 123,
            startsAt: 45,
          },
          updatedAt: '2023-01-23T14:00:28.460+00:00',
        },
        processed_at: null,
        topic: 'scheduler.AttendanceUpdatedEvent',
      },
    ]);

    jest.useRealTimers();
  });

  it('should assign an employee to attendance', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-23T14:00:28.460Z'));
    const knex = orm.em.getConnection().getKnex();
    const office = await seedOffice(orm);
    const client = await seedClient(office, orm);
    const visit = await seedVisit(office, client, orm);
    const employee = await seedEmployee(office, orm);
    await seedAttendance(
      {
        office,
        visit,
        date: ExactDate.create({
          year: 2023,
          month: 1,
          day: 28,
        }),
        time: TimeInterval.create({
          startsAt: 45,
          duration: 123,
        }),
      },
      orm,
    );

    jest.setSystemTime(new Date('2023-01-24T01:00:28.460Z'));

    const result = await attendancesService.assignEmployees(
      office.id.value,
      visit.id.value,
      '2023-01-28',
      new AssignEmployeesDto({
        employeeIds: [employee.id.value],
      }),
    );

    const result2 = await attendancesService.findOne(
      office.id.value,
      visit.id.value,
      '2023-01-28',
    );
    const outbox = await knex.select('*').from('outbox');

    expect(result).toEqual([
      {
        assignedAt: '2023-01-24T01:00:28.460+00:00',
        employeeId: employee.id.value,
      },
    ]);
    expect(result2).toEqual({
      date: '2023-01-28',
      visitId: visit.id.value,
      createdAt: '2023-01-23T14:00:28.460+00:00',
      updatedAt: '2023-01-24T01:00:28.460+00:00',
      assignedEmployees: [
        {
          assignedAt: '2023-01-24T01:00:28.460+00:00',
          employeeId: employee.id.value,
        },
      ],
      time: expect.objectContaining({
        duration: 123,
        startsAt: 45,
      }),
    });
    expect(outbox).toEqual([
      {
        created_at: DateTime.fromISO('2023-01-24T01:00:28.460+00:00'),
        id: expect.any(String),
        payload: {
          createdAt: '2023-01-23T14:00:28.460+00:00',
          employeeIds: [employee.id.value],
          id: {
            date: {
              day: 28,
              month: 1,
              year: 2023,
            },
            visitId: visit.id.value,
          },
          time: {
            duration: 123,
            startsAt: 45,
          },
          updatedAt: '2023-01-24T01:00:28.460+00:00',
        },
        processed_at: null,
        topic: 'scheduler.AttendanceUpdatedEvent',
      },
    ]);

    jest.useRealTimers();
  });

  it('should unassign an employee from attendance', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-23T14:00:28.460Z'));
    const knex = orm.em.getConnection().getKnex();
    const office = await seedOffice(orm);
    const client = await seedClient(office, orm);
    const visit = await seedVisit(office, client, orm);
    const employee = await seedEmployee(office, orm);
    await seedAttendance(
      {
        office,
        visit,
        date: ExactDate.create({
          year: 2023,
          month: 1,
          day: 28,
        }),
        time: TimeInterval.create({
          startsAt: 45,
          duration: 123,
        }),
        assingEmployee: employee,
      },
      orm,
    );
    await knex.delete().from('outbox');

    jest.setSystemTime(new Date('2023-01-24T01:00:28.460Z'));

    const result = await attendancesService.unassignEmployees(
      office.id.value,
      visit.id.value,
      '2023-01-28',
      new AssignEmployeesDto({
        employeeIds: [employee.id.value],
      }),
    );

    const result2 = await attendancesService.findOne(
      office.id.value,
      visit.id.value,
      '2023-01-28',
    );
    const outbox = await knex.select('*').from('outbox');

    expect(result).toEqual([]);
    expect(result2).toEqual({
      date: '2023-01-28',
      visitId: visit.id.value,
      createdAt: '2023-01-23T14:00:28.460+00:00',
      updatedAt: '2023-01-24T01:00:28.460+00:00',
      assignedEmployees: [],
      time: expect.objectContaining({
        duration: 123,
        startsAt: 45,
      }),
    });
    expect(outbox).toEqual([
      {
        created_at: DateTime.fromISO('2023-01-24T01:00:28.460+00:00'),
        id: expect.any(String),
        payload: {
          createdAt: '2023-01-23T14:00:28.460+00:00',
          employeeIds: [],
          id: {
            date: {
              day: 28,
              month: 1,
              year: 2023,
            },
            visitId: visit.id.value,
          },
          time: {
            duration: 123,
            startsAt: 45,
          },
          updatedAt: '2023-01-24T01:00:28.460+00:00',
        },
        processed_at: null,
        topic: 'scheduler.AttendanceUpdatedEvent',
      },
    ]);

    jest.useRealTimers();
  });

  afterEach(async () => {
    await orm.close();
  });
});

async function seedOffice(orm: MikroORM) {
  const office = Office.create({
    id: OfficeId.create(),
    name: 'Test Office',
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

async function seedVisit(office: Office, client: Client, orm: MikroORM) {
  const visit = Visit.create({
    id: VisitId.create(),
    name: 'Test Office',
    office,
    client,
    recurrence: WeeklyRecurrence.create([1, 2, 4]),
    time: TimeInterval.create({
      startsAt: 120,
      duration: 60,
    }),
    requiredEmployees: RequiredEmployees.create(3),
    now: DateTime.now(),
  });

  const visitRepository = orm.em.fork().getRepository(Visit);
  await visitRepository.persistAndFlush(visit);

  return visit;
}

async function seedEmployee(office: Office, orm: MikroORM) {
  const employee = Employee.create({
    id: EmployeeId.create(),
    name: 'Test Office',
    office,
    now: DateTime.now(),
  });

  const employeeRepository = orm.em.fork().getRepository(Employee);
  await employeeRepository.persistAndFlush(employee);

  return employee;
}

async function seedAttendance(
  data: {
    visit: Visit;
    office: Office;
    date: ExactDate;
    time: TimeInterval;
    assingEmployee?: Employee;
  },
  orm: MikroORM,
) {
  const id = AttendanceId.create();
  const attendance = Attendance.create({
    id,
    visit: data.visit,
    office: data.office,
    date: data.date,
    time: data.time,
    now: DateTime.now(),
  });

  if (data.assingEmployee) {
    attendance.assignEmployee(
      data.assingEmployee,
      data.visit,
      data.office,
      DateTime.now(),
    );
  }

  const attendanceRepository = orm.em.fork().getRepository(Attendance);
  await attendanceRepository.persistAndFlush(attendance);

  return attendance;
}
