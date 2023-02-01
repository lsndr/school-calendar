import { Entity } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { TeacherId } from './teacher-id';
import { TeacherState } from './teacher.state';
import { School } from './../school';

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
    const teacher = new this({
      id: data.id,
      name: data.name,
      schoolId: data.school.id,
      createdAt: data.now,
      updatedAt: data.now,
    });

    return teacher;
  }
}
