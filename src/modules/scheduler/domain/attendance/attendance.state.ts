import {
  Collection,
  Embedded,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateRoot } from '../../../shared/domain';
import {
  OfficeIdType,
  VisitIdType,
  AttendanceIdType,
  ExactDateType,
} from '../../database';
import { OfficeId } from '../office';
import { ExactDate, TimeInterval } from '../shared';
import { VisitId } from '../visit';

// eslint-disable-next-line import/no-cycle -- Required by MikroORM
import { AssignedEmployee } from './assigned-employee';
import { AttendanceId } from './attendance-id';

type CreateAttendanceState = {
  id: AttendanceId;
  visitId: VisitId;
  date: ExactDate;
  officeId: OfficeId;
  time: TimeInterval;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export abstract class AttendanceState extends AggregateRoot {
  @PrimaryKey({ name: 'id', type: AttendanceIdType })
  protected _id: AttendanceId;

  @Property({ name: 'visit_id', type: VisitIdType })
  protected _visitId: VisitId;

  @Property({ name: 'date', type: ExactDateType })
  protected _date: ExactDate;

  @Property({ name: 'office_id', type: OfficeIdType })
  protected _officeId: OfficeId;

  @OneToMany({
    entity: () => AssignedEmployee,
    mappedBy: 'attendance',
    orphanRemoval: true,
  })
  protected _assignedEmployees: Collection<AssignedEmployee>;

  @Embedded(() => TimeInterval, { prefix: 'time_' })
  protected _time: TimeInterval;

  @Property({ name: 'created_at' })
  protected _createdAt: DateTime;

  @Property({ name: 'updated_at' })
  protected _updatedAt: DateTime;

  @Property({ name: 'version', version: true })
  protected _version: number;

  protected constructor(state: CreateAttendanceState) {
    super();

    this._id = state.id;
    this._visitId = state.visitId;
    this._date = state.date;
    this._officeId = state.officeId;
    this._assignedEmployees = new Collection<AssignedEmployee>(this);
    this._time = state.time;
    this._createdAt = state.createdAt;
    this._updatedAt = state.updatedAt;
    this._version = 1;
  }
}
