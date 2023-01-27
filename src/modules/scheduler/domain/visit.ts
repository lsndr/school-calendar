import * as assert from 'assert';
import { DateTime } from 'luxon';
import { Aggregate, AggregateState } from '../../shared/domain';
import { Client } from './client';
import { ClientId } from './client-id';
import { Office } from './office';
import { OfficeId } from './office-id';
import {
  BiWeeklyPeriodicity,
  DailyPeriodicity,
  MonthlyPeriodicity,
  WeeklyPeriodicity,
} from './periodicity';
import { RequiredEmployees } from './required-employees';
import { TimeInterval } from './time-interval';
import { VisitId } from './visit-id';

export type VisitPeriodicity =
  | DailyPeriodicity
  | WeeklyPeriodicity
  | BiWeeklyPeriodicity
  | MonthlyPeriodicity;

export interface VisitState extends AggregateState<VisitId> {
  id: VisitId;
  officeId: OfficeId;
  name: string;
  periodicity: VisitPeriodicity;
  timeInterval: TimeInterval;
  clientId: ClientId;
  requiredEmployees: RequiredEmployees;
  createdAt: DateTime;
  updatedAt: DateTime;
}

type CreateVisit = {
  id: VisitId;
  name: string;
  office: Office;
  periodicity: VisitPeriodicity;
  timeInterval: TimeInterval;
  client: Client;
  requiredEmployees: RequiredEmployees;
  now: DateTime;
};

export class Visit extends Aggregate<VisitId, VisitState> {
  get officeId() {
    return this.state.officeId;
  }

  get name() {
    return this.state.name;
  }

  get periodicity() {
    return this.state.periodicity;
  }

  get clientId() {
    return this.state.clientId;
  }

  get requiredEmployees() {
    return this.state.requiredEmployees;
  }

  get timeInterval() {
    return this.state.timeInterval;
  }

  get createdAt() {
    return this.state.createdAt;
  }

  get updatedAt() {
    return this.state.updatedAt;
  }

  static create(data: CreateVisit) {
    assert.ok(
      data.office.id.value === data.client.officeId.value,
      'Office id and client office id must match',
    );

    return new this({
      id: data.id,
      clientId: data.client.id,
      officeId: data.office.id,
      name: data.name,
      requiredEmployees: data.requiredEmployees,
      periodicity: data.periodicity,
      timeInterval: data.timeInterval,
      createdAt: data.now,
      updatedAt: data.now,
    });
  }

  setName(name: string, updatedAt: DateTime) {
    this.state.name = name;
    this.state.updatedAt = updatedAt;
  }

  setPeriodicity(periodicity: VisitPeriodicity, updatedAt: DateTime) {
    this.state.periodicity = periodicity;
    this.state.updatedAt = updatedAt;
  }

  setTimeInterval(timeInterval: TimeInterval, updatedAt: DateTime) {
    this.state.timeInterval = timeInterval;
    this.state.updatedAt = updatedAt;
  }
}
