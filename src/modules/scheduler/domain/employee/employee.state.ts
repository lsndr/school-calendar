import { PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateState } from '../../../shared/domain';
import { EmployeeIdType, OfficeIdType } from '../../database';
import { EmployeeId } from './employee-id';
import { OfficeId } from './../office';

type CreateEmployeeState = {
  id: EmployeeId;
  name: string;
  officeId: OfficeId;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export abstract class EmployeeState extends AggregateState {
  @PrimaryKey({ name: 'id', type: EmployeeIdType })
  protected _id: EmployeeId;

  @Property({ name: 'name' })
  protected _name: string;

  @Property({ name: 'office_id', type: OfficeIdType })
  protected _officeId: OfficeId;

  @Property({ name: 'created_at' })
  protected _createdAt: DateTime;

  @Property({ name: 'updated_at' })
  protected _updatedAt: DateTime;

  @Property({ name: 'version', version: true })
  protected _version: number;

  constructor(state: CreateEmployeeState) {
    super();

    this._id = state.id;
    this._name = state.name;
    this._officeId = state.officeId;
    this._createdAt = state.createdAt;
    this._updatedAt = state.updatedAt;
    this._version = 1;
  }
}
