import { AttendancesService } from './attendances.service';
import { Test } from '@nestjs/testing';
import {
  Client,
  ClientId,
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
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../../test-utils';
import { CreateAttendanceDto } from './create-attendance.dto';

describe('Attendances Service', () => {
  let attendancesService: AttendancesService;
  let office: Office;
  let visit: Visit;
  let client: Client;
  let employee: Employee;
  let orm: MikroORM;

  beforeAll(async () => {
    jest.setTimeout(999999999999);
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [AttendancesService, testMikroormProvider],
    }).compile();

    attendancesService = moduleRef.get(AttendancesService);
    orm = moduleRef.get(MikroORM);
  });

  beforeEach(async () => {
    office = Office.create({
      id: OfficeId.create(),
      name: 'Test Office',
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

  beforeEach(async () => {
    visit = Visit.create({
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
  });

  beforeEach(async () => {
    employee = Employee.create({
      id: EmployeeId.create(),
      name: 'Test Office',
      office,
      now: DateTime.now(),
    });

    const employeeRepository = orm.em.fork().getRepository(Employee);
    await employeeRepository.persistAndFlush(employee);
  });

  it('should create an attendance', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-23T14:00:28.460Z'));

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

    jest.useRealTimers();
  });

  afterAll(async () => {
    await orm.close();
  });
});
