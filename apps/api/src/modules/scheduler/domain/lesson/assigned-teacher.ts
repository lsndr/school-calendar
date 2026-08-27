import { type DateTime } from 'luxon';
import { type AssignedTeacherId } from './assigned-teacher-id';
import { type TeacherId } from '../teacher';

export class AssignedTeacher {
  public id: AssignedTeacherId;
  public teacherId: TeacherId;
  public assignedAt: DateTime;

  public constructor(state: {
    id: AssignedTeacherId;
    teacherId: TeacherId;
    assignedAt: DateTime;
  }) {
    this.id = state.id;
    this.teacherId = state.teacherId;
    this.assignedAt = state.assignedAt;
  }
}
