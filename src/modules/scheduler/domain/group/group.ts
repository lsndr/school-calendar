import { Entity } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { GroupId } from './group-id';
import { GroupState } from './group.state';
import { School } from './../school';

export type CreateGroup = {
  id: GroupId;
  school: School;
  name: string;
  now: DateTime;
};

@Entity()
export class Group extends GroupState {
  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get schoolId() {
    return this._schoolId;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  static create(data: CreateGroup) {
    const group = new this({
      id: data.id,
      name: data.name,
      schoolId: data.school.id,
      createdAt: data.now,
      updatedAt: data.now,
    });

    return group;
  }
}
