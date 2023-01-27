import { Inject, Injectable } from '@nestjs/common';
import { KNEX_PROVIDER, UOW_PROVIDER } from '../../../shared/database';
import { Uow } from 'yuow';
import { EmployeeRepository, OfficeRepository } from '../../database';
import { Employee, EmployeeId } from '../../domain';
import { Knex } from 'knex';
import { CreateEmployeeDto } from './create-employee.dto';
import { EmployeeDto } from './employee.dto';
import { DateTime } from 'luxon';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(UOW_PROVIDER) private readonly uow: Uow,
    @Inject(KNEX_PROVIDER) private readonly knex: Knex,
  ) {}

  create(dto: CreateEmployeeDto) {
    return this.uow(async (ctx) => {
      const officeRepository = ctx.getRepository(OfficeRepository);
      const office = await officeRepository.findOne({
        id: dto.officeId,
      });

      if (!office) {
        throw new Error('Office not found');
      }

      const id = EmployeeId.create();
      const name = dto.name;

      const employee = Employee.create({
        id,
        name,
        office: office,
        now: DateTime.now(),
      });

      const employeeRepository = ctx.getRepository(EmployeeRepository);
      employeeRepository.add(employee);

      return new EmployeeDto({
        id: employee.id.value,
        name: employee.name,
      });
    });
  }

  async findOne(id: string) {
    const record = await this.knex
      .select(['id', 'name'])
      .from('employees')
      .where('id', id)
      .first();

    if (!record) {
      return;
    }

    return new EmployeeDto({
      id: record.id,
      name: record.name,
    });
  }
}
