import { type DateTime } from 'luxon';
import { type TeacherId } from './teacher-id';
import { TeacherState } from './teacher.state';
import { type School, type SchoolId } from './../school';

export interface CreateTeacher {
  id: TeacherId;
  name: string;
  school: School;
  now: DateTime;
}

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
    return new this({
      id: data.id,
      name: data.name,
      schoolId: data.school.id,
      createdAt: data.now,
      updatedAt: data.now,
    });
  }
}
