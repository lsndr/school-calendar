import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateState } from '../../shared/domain';
import { SchoolIdType, GroupIdType } from '../database';
import { GroupId } from './group-id';
import { School } from './school';
import { SchoolId } from './school-id';

abstract class GroupState extends AggregateState {
  @PrimaryKey({ name: 'id', type: GroupIdType })
  protected _id!: GroupId;

  @Property({ name: 'name' })
  protected _name!: string;

  @Property({ name: 'school_id', type: SchoolIdType })
  protected _schoolId!: SchoolId;

  @Property({ name: 'created_at' })
  protected _createdAt!: DateTime;

  @Property({ name: 'updated_at' })
  protected _updatedAt!: DateTime;

  @Property({ name: 'version', version: true })
  protected _version!: number;
}

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
    const group = new this();

    group._id = data.id;
    group._name = data.name;
    group._schoolId = data.school.id;
    group._createdAt = data.now;
    group._updatedAt = data.now;

    return group;
  }
}