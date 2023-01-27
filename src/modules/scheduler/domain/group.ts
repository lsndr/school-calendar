import { DateTime } from 'luxon';
import { Aggregate, AggregateState } from '../../shared/domain';
import { GroupId } from './group-id';
import { School } from './school';
import { SchoolId } from './school-id';

export interface GroupState extends AggregateState<GroupId> {
  name: string;
  schoolId: SchoolId;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export type CreateGroup = {
  id: GroupId;
  school: School;
  name: string;
  now: DateTime;
};

export class Group extends Aggregate<GroupId, GroupState> {
  get name() {
    return this.state.name;
  }

  get schoolId() {
    return this.state.schoolId;
  }

  get createdAt() {
    return this.state.createdAt;
  }

  get updatedAt() {
    return this.state.updatedAt;
  }

  static create(data: CreateGroup) {
    return new this({
      id: data.id,
      name: data.name,
      schoolId: data.school.id,
      createdAt: data.now,
      updatedAt: data.now,
    });
  }
}
