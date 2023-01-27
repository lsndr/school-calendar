import { DataMapper } from 'yuow';
import { Employee } from '../../domain';
import { OfficeIdHydrator } from '../office';
import { EmployeeIdHydrator } from './employee-id.hydrator';
import { EmployeeHydrator } from './employee.hydrator';

export interface FindOneEmployeeQuery {
  id?: string;
}

export interface FindManyEmployeesQuery {
  ids?: string[];
  officeId?: string;
}

export class EmployeeDataMapper extends DataMapper<Employee> {
  async findOne(query: FindOneEmployeeQuery): Promise<Employee | undefined> {
    const ids: string[] = [];

    if (typeof query.id !== 'undefined') {
      ids.push(query.id);
    }

    const employees = await this.findMany({
      ids,
    });

    return employees[0];
  }

  async findMany(query: FindManyEmployeesQuery): Promise<Employee[]> {
    const queryBuilder = this.knex
      .select([
        'id',
        'name',
        'office_id',
        'version',
        'updated_at',
        'created_at',
      ])
      .from('employees');

    if (typeof query.ids !== 'undefined') {
      if (query.ids.length > 0) {
        queryBuilder.whereIn('id', query.ids);
      } else {
        return [];
      }
    }

    if (typeof query.officeId !== 'undefined') {
      queryBuilder.where('office_id', query.officeId);
    }

    const records = await queryBuilder;

    const employees: Employee[] = [];

    for (const record of records) {
      const employee = this.map(record);
      this.setVersion(employee, record.version);

      employees.push(employee);
    }

    return employees;
  }

  async insert(employee: Employee): Promise<boolean> {
    return this.upsert(employee);
  }

  async update(employee: Employee): Promise<boolean> {
    return this.upsert(employee);
  }

  private async upsert(employee: Employee): Promise<boolean> {
    const version = this.increaseVersion(employee);

    const result: any = await this.knex
      .insert({
        id: employee.id.value,
        name: employee.name,
        office_id: employee.officeId.value,
        version,
        created_at: employee.createdAt.toJSDate(),
        updated_at: employee.updatedAt.toJSDate(),
      })
      .into('employees')
      .onConflict('id')
      .merge()
      .where('employees.id', employee.id.value)
      .andWhere('employees.version', version - 1);

    return result.rowCount > 0;
  }

  async delete(employee: Employee): Promise<boolean> {
    const version = this.getVersion(employee);

    const result: any = await this.knex
      .delete()
      .from('employees')
      .where('employees.id', employee.id.value)
      .andWhere('employees.version', version);

    return result.rowCount > 0;
  }

  private map(record: any) {
    const id = new EmployeeIdHydrator(record.id);
    const officeId = new OfficeIdHydrator(record.office_id);
    const createdAt = record.created_at;
    const updatedAt = record.updated_at;

    return new EmployeeHydrator({
      id,
      name: record.name,
      officeId,
      createdAt,
      updatedAt,
    });
  }
}
