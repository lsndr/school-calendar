import { PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateRoot } from '../../../shared/domain';
import { EmployeeIdType, OfficeIdType } from '../../database';
import { EmployeeId } from './employee-id';
import { OfficeId } from './../office';
import { DateTimeType } from '../../../shared/database/types';

type CreateEmployeeState = {
  id: EmployeeId;
  name: string;
  officeId: OfficeId;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export abstract class EmployeeState extends AggregateRoot {
  @PrimaryKey({ name: 'id', type: EmployeeIdType })
  protected _id: EmployeeId;

  @Property({ name: 'name' })
  protected _name: string;

  @Property({ name: 'office_id', type: OfficeIdType })
  protected _officeId: OfficeId;

  @Property({ name: 'created_at', type: DateTimeType })
  protected _createdAt: DateTime;

  @Property({ name: 'updated_at', type: DateTimeType })
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
