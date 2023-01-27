import { DateTime } from 'luxon';
import { Aggregate, AggregateState } from '../../shared/domain';
import { EmployeeId } from './employee-id';
import { Office } from './office';
import { OfficeId } from './office-id';

export interface EmployeeState extends AggregateState<EmployeeId> {
  name: string;
  createdAt: DateTime;
  officeId: OfficeId;
  updatedAt: DateTime;
}

export type CreateEmployee = {
  id: EmployeeId;
  name: string;
  office: Office;
  now: DateTime;
};

export class Employee extends Aggregate<EmployeeId, EmployeeState> {
  get name() {
    return this.state.name;
  }

  get officeId() {
    return this.state.officeId;
  }

  get createdAt() {
    return this.state.createdAt;
  }

  get updatedAt() {
    return this.state.updatedAt;
  }

  static create(data: CreateEmployee) {
    return new this({
      id: data.id,
      name: data.name,
      officeId: data.office.id,
      createdAt: data.now,
      updatedAt: data.now,
    });
  }
}
