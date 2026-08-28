import { type DateTime } from 'luxon';
import { type GroupId } from './group-id';
import { GroupState } from './group.state';
import { type School, type SchoolId } from './../school';

export interface CreateGroup {
  id: GroupId;
  school: School;
  name: string;
  now: DateTime;
}

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
    return new this({
      id: data.id,
      name: data.name,
      schoolId: data.school.id,
      createdAt: data.now,
      updatedAt: data.now,
    });
  }
}
