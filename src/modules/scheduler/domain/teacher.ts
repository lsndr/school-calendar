import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateState } from '../../shared/domain';
import { TeacherIdType, SchoolIdType } from '../database';
import { TeacherId } from './teacher-id';
import { School } from './school';
import { SchoolId } from './school-id';

abstract class TeacherState extends AggregateState {
  @PrimaryKey({ name: 'id', type: TeacherIdType })
  protected _id!: TeacherId;

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

export type CreateTeacher = {
  id: TeacherId;
  name: string;
  school: School;
  now: DateTime;
};

@Entity()
export class Teacher extends TeacherState {
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

  static create(data: CreateTeacher) {
    const teacher = new this();

    teacher._id = data.id;
    teacher._name = data.name;
    teacher._schoolId = data.school.id;
    teacher._createdAt = data.now;
    teacher._updatedAt = data.now;

    return teacher;
  }
}