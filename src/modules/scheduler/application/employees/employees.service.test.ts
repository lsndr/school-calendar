import { EmployeesService } from './employees.service';
import { Test } from '@nestjs/testing';
import {
  knexProvider,
  uowProvider,
  KNEX_PROVIDER,
  UOW_PROVIDER,
} from '../../../shared/database';
import { Knex } from 'knex';
import { recreateDb } from '../../../../../test-utils';
import { Office, OfficeId, TimeZone } from '../../domain';
import { Uow } from 'yuow';
import { DateTime } from 'luxon';
import { OfficeRepository } from '../../database';

describe('Employees Service', () => {
  let employeesService: EmployeesService;
  let office: Office;
  let knex: Knex;
  let uow: Uow;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [EmployeesService, knexProvider, uowProvider],
    }).compile();

    employeesService = moduleRef.get(EmployeesService);
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
    await knex.destroy();
  });
});
