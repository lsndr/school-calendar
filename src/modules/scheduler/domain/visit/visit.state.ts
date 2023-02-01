import { Embedded, PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateRoot } from '../../../shared/domain';
import {
  ClientIdType,
  OfficeIdType,
  VisitIdType,
  RequiredEmployeesType,
} from '../../database';
import {
  BiWeeklyRecurrence,
  DailyRecurrence,
  MonthlyRecurrence,
  Recurrence,
  WeeklyRecurrence,
} from './recurrence';
import { TimeInterval } from '../shared';
import { ClientId } from './../client';
import { OfficeId } from './../office';
import { RequiredEmployees } from './required-employees';

import { VisitId } from './visit-id';

type CreateVisitState = {
  id: VisitId;
  name: string;
  officeId: OfficeId;
  recurrence: Recurrence;
  time: TimeInterval;
  clientId: ClientId;
  requiredEmployees: RequiredEmployees;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export abstract class VisitState extends AggregateRoot {
  @PrimaryKey({ name: 'id', type: VisitIdType })
  protected _id: VisitId;

  @Property({ name: 'name' })
  protected _name: string;

  @Property({ name: 'office_id', type: OfficeIdType })
  protected _officeId: OfficeId;

  @Embedded(
    () => [
      DailyRecurrence,
      WeeklyRecurrence,
      BiWeeklyRecurrence,
      MonthlyRecurrence,
    ],
    { prefix: 'recurrence_' },
  )
  protected _recurrence: Recurrence;

  @Embedded(() => TimeInterval, { prefix: 'time_' })
  protected _time: TimeInterval;

  @Property({ name: 'client_id', type: ClientIdType })
  protected _clientId: ClientId;

  @Property({ name: 'required_employees', type: RequiredEmployeesType })
  protected _requiredEmployees: RequiredEmployees;

  @Property({ name: 'created_at' })
  protected _createdAt: DateTime;

  @Property({ name: 'updated_at' })
  protected _updatedAt: DateTime;

  @Property({ name: 'version', version: true })
  protected _version: number;

  protected constructor(state: CreateVisitState) {
    super();

    this._id = state.id;
    this._name = state.name;
    this._officeId = state.officeId;
    this._recurrence = state.recurrence;
    this._time = state.time;
    this._clientId = state.clientId;
    this._requiredEmployees = state.requiredEmployees;
    this._createdAt = state.createdAt;
    this._updatedAt = state.updatedAt;
    this._version = 1;
  }
}
