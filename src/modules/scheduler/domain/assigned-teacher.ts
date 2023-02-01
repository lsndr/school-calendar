import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { TeacherIdType } from '../database';
import { AssignedTeacherId } from './assigned-teacher-id';
import { Lesson } from './lesson';
import { TeacherId } from './teacher-id';

@Entity({ tableName: 'lesson_teacher', customRepository: () => Object })
export class AssignedTeacher {
  @PrimaryKey({ type: TeacherIdType })
  id: AssignedTeacherId;

  @Property({ type: TeacherIdType })
  teacherId: TeacherId;

  @Property()
  assignedAt: DateTime;

  @ManyToOne(() => Lesson)
  lesson!: Rel<Lesson>;

  constructor(state: Omit<AssignedTeacher, 'lesson'>) {
    this.id = state.id;
    this.teacherId = state.teacherId;
    this.assignedAt = state.assignedAt;
  }
}
