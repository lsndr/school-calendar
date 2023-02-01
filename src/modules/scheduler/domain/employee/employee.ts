import { Entity } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { EmployeeId } from './employee-id';
import { EmployeeState } from './employee.state';
import { Office } from './../office';

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
    const employee = new this({
      id: data.id,
      name: data.name,
      officeId: data.office.id,
      createdAt: data.now,
      updatedAt: data.now,
    });

    return employee;
  }
}
