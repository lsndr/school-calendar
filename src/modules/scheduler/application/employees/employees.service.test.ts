import { EmployeesService } from './employees.service';
import { Test } from '@nestjs/testing';
import { MIKROORM_PROVIDER } from '../../../shared/database';
import { Office, OfficeId, TimeZone } from '../../domain';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../../test-utils';

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
    orm = moduleRef.get(MIKROORM_PROVIDER);
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
    const result = await employeesService.create({
      name: 'Test Employee',
      officeId: office.id.value,
    });

    const result2 = await employeesService.findOne(result.id);

    expect(result).toEqual(result2);
    expect(result).toEqual({
      id: expect.any(String),
      name: 'Test Employee',
    });
  });

  it('should fail to create an employee if office not found', async () => {
    const result = () =>
      employeesService.create({
        name: 'Test Client',
        officeId: 'wrong-office-id',
      });

    await expect(result).rejects.toThrowError('Office not found');
  });

  afterAll(async () => {
    await orm.close();
  });
});
