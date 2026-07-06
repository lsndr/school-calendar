import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AssignedTeacherIdType, TeacherIdType } from '../../database';
import { AssignedTeacherId } from './assigned-teacher-id';
import { Lesson } from './lesson';
import { TeacherId } from '../teacher';
import { DateTimeType } from '../../../shared/database/types';

@Entity({ tableName: 'lesson_teacher', customRepository: () => Object })
export class AssignedTeacher {
  @PrimaryKey({ type: AssignedTeacherIdType })
  public id: AssignedTeacherId;

  @Property({ type: TeacherIdType })
  public teacherId: TeacherId;

  @Property({ type: DateTimeType })
  public assignedAt: DateTime;

  @ManyToOne(() => Lesson)
  public lesson!: Rel<Lesson>;

  public constructor(state: Omit<AssignedTeacher, 'lesson'>) {
    this.id = state.id;
    this.teacherId = state.teacherId;
    this.assignedAt = state.assignedAt;
  }
}
