import { Entity } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { GroupId } from './group-id';
import { GroupState } from './group.state';
import { School, SchoolId } from './../school';

export interface CreateGroup {
  id: GroupId;
  school: School;
  name: string;
  now: DateTime;
}

@Entity()
export class Group extends GroupState {
  public get id(): GroupId {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get schoolId(): SchoolId {
    return this._schoolId;
  }

  public get createdAt(): DateTime {
    return this._createdAt;
  }

  public get updatedAt(): DateTime {
    return this._updatedAt;
  }

  public static create(data: CreateGroup): Group {
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
