import { AttendancesService } from './attendances.service';
import { Test } from '@nestjs/testing';
import {
  knexProvider,
  uowProvider,
  KNEX_PROVIDER,
  UOW_PROVIDER,
} from '../../../shared/database';
import { Knex } from 'knex';
import { recreateDb } from '../../../../../test-utils';
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
  WeeklyPeriodicity,
} from '../../domain';
import { DateTime } from 'luxon';
import { Uow } from 'yuow';
import {
  ClientRepository,
  EmployeeRepository,
  OfficeRepository,
  VisitRepository,
} from '../../database';

describe('Attendances Service', () => {
  let attendancesService: AttendancesService;
  let office: Office;
  let visit: Visit;
  let client: Client;
  let knex: Knex;
  let uow: Uow;
  let employee: Employee;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [AttendancesService, knexProvider, uowProvider],
    }).compile();

    attendancesService = moduleRef.get(AttendancesService);
    knex = moduleRef.get(KNEX_PROVIDER);
    uow = moduleRef.get(UOW_PROVIDER);
  });

  beforeEach(async () => {
    await recreateDb(knex);
  });

  beforeEach(async () => {
    office = Office.create({
      id: OfficeId.create(),
      name: 'Test Office',
      timeZone: TimeZone.create('Europe/Moscow'),
      now: DateTime.now(),
    });

    await uow(async (ctx) => {
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

  beforeEach(async () => {
    visit = Visit.create({
      id: VisitId.create(),
      name: 'Test Office',
      office,
      client,
      periodicity: WeeklyPeriodicity.create([1, 2, 4]),
      timeInterval: TimeInterval.create({
        startsAt: 120,
        duration: 60,
      }),
      requiredEmployees: RequiredEmployees.create(3),
      now: DateTime.now(),
    });

    await uow(async (ctx) => {
      const visitRepository = ctx.getRepository(VisitRepository);
      visitRepository.add(visit);
    });
  });

  beforeEach(async () => {
    employee = Employee.create({
      id: EmployeeId.create(),
      name: 'Test Office',
      office,
      now: DateTime.now(),
    });

    await uow(async (ctx) => {
      const employeeRepository = ctx.getRepository(EmployeeRepository);
      employeeRepository.add(employee);
    });
  });

  it('should create an attendance', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-23T14:00:28.460Z'));

    const result = await attendancesService.create(
      office.id.value,
      visit.id.value,
      {
        date: '2023-01-24',
        employeeIds: [employee.id.value],
        timeInterval: {
          startsAt: 45,
          duration: 123,
        },
      },
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
      employeeIds: [employee.id.value],
      timeInterval: expect.objectContaining({
        duration: 123,
        startsAt: 45,
      }),
    });
    expect(result).toEqual({
      date: '2023-01-24',
      visitId: visit.id.value,
      createdAt: '2023-01-23T14:00:28.460+00:00',
      updatedAt: '2023-01-23T14:00:28.460+00:00',
      employeeIds: [employee.id.value],
      timeInterval: expect.objectContaining({
        duration: 123,
        startsAt: 45,
      }),
    });

    jest.useRealTimers();
  });

  afterAll(async () => {
    await knex.destroy();
  });
});
