import { EmployeesService } from './employees.service';
import { Test } from '@nestjs/testing';
import { Office, OfficeId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../../test-utils';
import { CreateEmployeeDto } from './create-employee.dto';

describe('Employees Service', () => {
  let employeesService: EmployeesService;
  let office: Office;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [EmployeesService, testMikroormProvider],
    }).compile();

    employeesService = moduleRef.get(EmployeesService);
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

  it('should create an employee', async () => {
    const result = await employeesService.create(
      office.id.value,
      new CreateEmployeeDto({
        name: 'Test Employee',
      }),
    );

    const result2 = await employeesService.findOne(result.id);

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Employee',
    });
  });

  it('should fail to create an employee if office not found', async () => {
    const result = () =>
      employeesService.create('wrong-office-id', {
        name: 'Test Client',
      });

    await expect(result).rejects.toThrowError('Office not found');
  });

  afterAll(async () => {
    await orm.close();
  });
});
