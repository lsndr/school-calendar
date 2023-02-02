import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { TeacherIdType } from '../../database';
import { AssignedTeacherId } from './assigned-teacher-id';
// eslint-disable-next-line import/no-cycle -- Required by MikroORM
import { Lesson } from './lesson';
import { TeacherId } from '../teacher';
import { DateTimeType } from '../../../shared/database/types';

@Entity({ tableName: 'lesson_teacher', customRepository: () => Object })
export class AssignedTeacher {
  @PrimaryKey({ type: TeacherIdType })
  id: AssignedTeacherId;

  @Property({ type: TeacherIdType })
  teacherId: TeacherId;

  @Property({ type: DateTimeType })
  assignedAt: DateTime;

  @ManyToOne(() => Lesson)
  lesson!: Rel<Lesson>;

  constructor(state: Omit<AssignedTeacher, 'lesson'>) {
    this.id = state.id;
    this.teacherId = state.teacherId;
    this.assignedAt = state.assignedAt;
  }
}
