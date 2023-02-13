import { Entity } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { Recurrence } from './recurrence';
import { ExactDate, TimeInterval } from '../shared';
import { Client } from './../client';
import { Office } from './../office';
import { RequiredEmployees } from './required-employees';
import { VisitId } from './visit-id';
import { VisitState } from './visit.state';
import { extractDatesFromPeriodicity } from './helpers';

export type CreateVisit = {
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
    this.assert(
      data.office.id.value === data.client.officeId.value,
      'client_doesnt_belong_to_office',
    );

    const visit = new this({
      id: data.id,
      clientId: data.client.id,
      officeId: data.office.id,
      name: data.name,
      requiredEmployees: data.requiredEmployees,
      recurrence: data.recurrence,
      time: data.time,
      createdAt: data.now,
      updatedAt: data.now,
    });

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

  setRequiredEmployees(requiredEmployees: RequiredEmployees, now: DateTime) {
    this._requiredEmployees = requiredEmployees;
    this._updatedAt = now;
  }

  doesOccureOn(date: ExactDate, office: Office): boolean {
    this.assert(this._officeId.value === office.id.value, 'wrong_office');

    const dateTime = date.toDateTime(office.timeZone);

    const dates = extractDatesFromPeriodicity(
      dateTime,
      dateTime.plus({ day: 1 }),
      {
        timeZone: office.timeZone.value,
        calculateSince: this._createdAt,
        recurence: this.recurrence,
      },
    );

    return !!dates.next().value;
  }
}
