import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateState } from '../../shared/domain';
import { EmployeeIdType, OfficeIdType } from '../database';
import { EmployeeId } from './employee-id';
import { Office } from './office';
import { OfficeId } from './office-id';

abstract class EmployeeState extends AggregateState {
  @PrimaryKey({ name: 'id', type: EmployeeIdType })
  protected _id!: EmployeeId;

  @Property({ name: 'name' })
  protected _name!: string;

  @Property({ name: 'office_id', type: OfficeIdType })
  protected _officeId!: OfficeId;

  @Property({ name: 'created_at' })
  protected _createdAt!: DateTime;

  @Property({ name: 'updated_at' })
  protected _updatedAt!: DateTime;

  @Property({ name: 'version', version: true })
  protected _version!: number;
}

export type CreateEmployee = {
  id: EmployeeId;
  name: string;
  office: Office;
  now: DateTime;
};

@Entity()
export class Employee extends EmployeeState {
  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get officeId() {
    return this._officeId;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  static create(data: CreateEmployee) {
    const employee = new this();

    employee._id = data.id;
    employee._name = data.name;
    employee._officeId = data.office.id;
    employee._createdAt = data.now;
    employee._updatedAt = data.now;

    return employee;
  }
}
