import { Injectable } from '@nestjs/common';
import { Employee, EmployeeId, Office } from '../../domain';
import { CreateEmployeeDto } from './create-employee.dto';
import { EmployeeDto } from './employee.dto';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';

@Injectable()
export class EmployeesService {
  constructor(private readonly orm: MikroORM) {}

  async create(officeId: string, dto: CreateEmployeeDto) {
    const em = this.orm.em.fork();
    const officeRepository = em.getRepository(Office);
    const employeeRepository = em.getRepository(Employee);

    const office = await officeRepository
      .createQueryBuilder()
      .where({
        id: officeId,
      })
      .getSingleResult();

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

    await employeeRepository.persistAndFlush(employee);

    return new EmployeeDto({
      id: employee.id.value,
      name: employee.name,
    });
  }

  async findOne(id: string) {
    const knex = this.orm.em.getConnection().getKnex();

    const record = await knex
      .select(['id', 'name'])
      .from('employee')
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

  async findMany(officeId: string) {
    const knex = this.orm.em.getConnection().getKnex();

    const records = await knex
      .select(['id', 'name'])
      .from('employee')
      .where('office_id', officeId);

    const employees: EmployeeDto[] = [];

    for (const record of records) {
      employees.push(
        new EmployeeDto({
          id: record.id,
          name: record.name,
        }),
      );
    }

    return employees;
  }
}
