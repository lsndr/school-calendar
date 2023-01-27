import { DateTime } from 'luxon';
import { Aggregate, AggregateState } from '../../shared/domain';
import { TeacherId } from './teacher-id';
import { School } from './school';
import { SchoolId } from './school-id';

export interface TeacherState extends AggregateState<TeacherId> {
  name: string;
  createdAt: DateTime;
  schoolId: SchoolId;
  updatedAt: DateTime;
}

export type CreateTeacher = {
  id: TeacherId;
  name: string;
  school: School;
  now: DateTime;
};

export class Teacher extends Aggregate<TeacherId, TeacherState> {
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

  static create(data: CreateTeacher) {
    return new this({
      id: data.id,
      name: data.name,
      schoolId: data.school.id,
      createdAt: data.now,
      updatedAt: data.now,
    });
  }
}
