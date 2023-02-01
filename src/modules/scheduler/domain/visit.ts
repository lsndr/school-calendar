import { Embedded, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import * as assert from 'assert';
import { DateTime } from 'luxon';
import { AggregateState } from '../../shared/domain';
import { ClientIdType, OfficeIdType } from '../database';
import { VisitIdType, RequiredEmployeesType } from '../database/visit';
import { Client } from './client';
import { ClientId } from './client-id';
import { Office } from './office';
import { OfficeId } from './office-id';
import {
  BiWeeklyRecurrence,
  DailyRecurrence,
  MonthlyRecurrence,
  WeeklyRecurrence,
} from './recurrence';

import { RequiredEmployees } from './required-employees';
import { TimeInterval } from './time-interval';
import { VisitId } from './visit-id';

type Recurrence =
  | DailyRecurrence
  | WeeklyRecurrence
  | BiWeeklyRecurrence
  | MonthlyRecurrence;

abstract class VisitState extends AggregateState {
  @PrimaryKey({ name: 'id', type: VisitIdType })
  protected _id!: VisitId;

  @Property({ name: 'name' })
  protected _name!: string;

  @Property({ name: 'office_id', type: OfficeIdType })
  protected _officeId!: OfficeId;

  @Embedded(
    () => [
      DailyRecurrence,
      WeeklyRecurrence,
      BiWeeklyRecurrence,
      MonthlyRecurrence,
    ],
    { prefix: 'recurrence_' },
  )
  protected _recurrence!: Recurrence;

  @Embedded(() => TimeInterval, { prefix: 'time_' })
  protected _time!: TimeInterval;

  @Property({ name: 'client_id', type: ClientIdType })
  protected _clientId!: ClientId;

  @Property({ name: 'required_employees', type: RequiredEmployeesType })
  protected _requiredEmployees!: RequiredEmployees;

  @Property({ name: 'created_at' })
  protected _createdAt!: DateTime;

  @Property({ name: 'updated_at' })
  protected _updatedAt!: DateTime;

  @Property({ name: 'version', version: true })
  protected _version!: number;
}

type CreateVisit = {
  id: VisitId;
  name: string;
  office: Office;
  recurrence: Recurrence;
  time: TimeInterval;
  client: Client;
  requiredEmployees: RequiredEmployees;
  now: DateTime;
};

@Entity()
export class Visit extends VisitState {
  get id() {
    return this._id;
  }

  get officeId() {
    return this._officeId;
  }

  get name() {
    return this._name;
  }

  get recurrence() {
    return this._recurrence;
  }

  get clientId() {
    return this._clientId;
  }

  get requiredEmployees() {
    return this._requiredEmployees;
  }

  get time() {
    return this._time;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  static create(data: CreateVisit) {
    assert.ok(
      data.office.id.value === data.client.officeId.value,
      'Office id and client office id must match',
    );

    const visit = new this();

    visit._id = data.id;
    visit._clientId = data.client.id;
    visit._officeId = data.office.id;
    visit._name = data.name;
    visit._requiredEmployees = data.requiredEmployees;
    visit._recurrence = data.recurrence;
    visit._time = data.time;
    visit._createdAt = data.now;
    visit._updatedAt = data.now;

    return visit;
  }

  setName(name: string, now: DateTime) {
    this._name = name;
    this._updatedAt = now;
  }

  setRecurrence(recurrence: Recurrence, now: DateTime) {
    this._recurrence = recurrence;
    this._updatedAt = now;
  }

  setTime(time: TimeInterval, now: DateTime) {
    this._time = time;
    this._updatedAt = now;
  }
}
