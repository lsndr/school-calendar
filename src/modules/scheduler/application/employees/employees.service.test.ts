import { EmployeesService } from './employees.service';
import { Test } from '@nestjs/testing';
import { Office, OfficeId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../../test-utils';
import { CreateEmployeeDto } from './create-employee.dto';

describe('Employees Service', () => {
  let employeesService: EmployeesService;
  let orm: MikroORM;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [EmployeesService, testMikroormProvider],
    }).compile();

    employeesService = moduleRef.get(EmployeesService);
    orm = moduleRef.get(MikroORM);
  });

  it('should create an employee', async () => {
    const office = await seedOffice(orm);

    const result = await employeesService.create(
      office.id.value,
      new CreateEmployeeDto({
        name: 'Test Employee',
      }),
    );

    const result2 = await employeesService.findOne(office.id.value, result.id);

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

  it('should find employees', async () => {
    const office1 = await seedOffice(orm);
    const office2 = await seedOffice(orm);

    await employeesService.create(office1.id.value, {
      name: 'Employee 11',
    });
    await employeesService.create(office1.id.value, {
      name: 'Employee 12',
    });
    await employeesService.create(office2.id.value, {
      name: 'Employee 21',
    });

    const result = await employeesService.findMany(office1.id.value);

    expect(result).toEqual([
      {
        id: expect.any(String),
        name: 'Employee 11',
      },
      {
        id: expect.any(String),
        name: 'Employee 12',
      },
    ]);
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

  const officeRepository = orm.em.fork();
  await officeRepository.persistAndFlush(office);

  return office;
}
