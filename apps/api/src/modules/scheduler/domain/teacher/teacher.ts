import { Entity } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { TeacherId } from './teacher-id';
import { TeacherState } from './teacher.state';
import { School, SchoolId } from './../school';

export interface CreateTeacher {
  id: TeacherId;
  name: string;
  school: School;
  now: DateTime;
}

@Entity()
export class Teacher extends TeacherState {
  public get id(): TeacherId {
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

  public static create(data: CreateTeacher): Teacher {
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
