import { DataMapper } from 'yuow';
import { Lesson, TeacherId } from '../../domain';
import { TeacherIdHydrator } from '../teacher/teacher-id.hydrator';
import { SchoolIdHydrator } from '../school';
import { TimeIntervalHydartor } from '../subject/time-interval.hydrator';
import { LessonIdHydrator } from './lesson-id.hydrator';
import { LessonHydrator } from './lesson.hydrator';
import { ExactDateHydrator } from './exact-date.hydrator';

export interface FindOneLessonQuery {
  id?: {
    subjectId: string;
    date: string;
  };
  schoolId?: string;
}

export class LessonDataMapper extends DataMapper<Lesson> {
  async findOne(query: FindOneLessonQuery) {
    const recordQuery = this.knex
      .select([
        'subject_id',
        'date',
        'school_id',
        'starts_at',
        'duration',
        'version',
        'created_at',
        'updated_at',
      ])
      .from('lessons');

    if (typeof query.id !== 'undefined') {
      recordQuery
        .where('subject_id', query.id.subjectId)
        .andWhere('date', query.id.date);
    }

    if (typeof query.schoolId !== 'undefined') {
      recordQuery.where('school_id', query.schoolId);
    }

    const record = await recordQuery.first();

    if (!record) {
      return;
    }

    const teacherRecords = await this.knex
      .select('teacher_id')
      .from('lessons_teachers')
      .where('subject_id', record.subject_id)
      .andWhere('date', record.date);

    const lesson = this.map(record, teacherRecords);
    this.setVersion(lesson, record.version);

    return lesson;
  }

  async insert(lesson: Lesson): Promise<boolean> {
    return this.upsert(lesson);
  }

  async update(lesson: Lesson): Promise<boolean> {
    return this.upsert(lesson);
  }

  private async upsert(lesson: Lesson): Promise<boolean> {
    const version = this.increaseVersion(lesson);

    const lessonQuery = this.knex
      .insert({
        subject_id: lesson.id.subjectId.value,
        school_id: lesson.schoolId.value,
        date: lesson.id.date.toDateTime().toSQL(),
        starts_at: lesson.timeInterval.startsAt,
        duration: lesson.timeInterval.duration,
        updated_at: lesson.updatedAt.toSQL(),
        created_at: lesson.createdAt.toSQL(),
        version,
      })
      .into('lessons')
      .onConflict(['subject_id', 'date'])
      .merge()
      .where('lessons.subject_id', lesson.id.subjectId.value)
      .andWhere('lessons.date', lesson.id.date.toDateTime().toSQL())
      .andWhere('lessons.version', version - 1);

    const deleteTeachersQuery = this.knex
      .delete()
      .from('lessons_teachers')
      .where('subject_id', lesson.id.subjectId.value)
      .andWhere('date', lesson.id.date.toDateTime().toSQL());

    const [result] = await Promise.all<any[]>([
      lessonQuery,
      deleteTeachersQuery,
    ]);

    const teacherValues = Array.from(lesson.teacherIds).map((id) => ({
      subject_id: lesson.id.subjectId.value,
      date: lesson.id.date.toDateTime().toSQL(),
      teacher_id: id.value,
    }));

    if (teacherValues.length > 0) {
      await this.knex.insert(teacherValues).into('lessons_teachers');
    }

    return result.rowCount > 0;
  }

  async delete(lesson: Lesson): Promise<boolean> {
    const version = this.getVersion(lesson);

    const result: any = await this.knex
      .delete()
      .from('lessons')
      .where('id', lesson.id.subjectId.value)
      .andWhere('date', lesson.id.date.toDateTime().toSQL())
      .andWhere('version', version);

    return result.rowCount > 0;
  }

  private map(lessonRecord: any, teacherRecords: any[]) {
    const date = new ExactDateHydrator({
      day: lessonRecord.date.getDate(),
      month: lessonRecord.date.getMonth() + 1,
      year: lessonRecord.date.getFullYear(),
    });
    const id = new LessonIdHydrator(lessonRecord.subject_id, date);
    const schoolId = new SchoolIdHydrator(lessonRecord.school_id);
    const timeInterval = new TimeIntervalHydartor({
      startsAt: lessonRecord.starts_at,
      duration: lessonRecord.duration,
    });
    const createdAt = lessonRecord.created_at;
    const updatedAt = lessonRecord.updated_at;

    const teacherIds = teacherRecords.reduce<Map<string, TeacherId>>(
      (map, record) => {
        return map.set(
          record.teacher_id,
          new TeacherIdHydrator(record.teacher_id),
        );
      },
      new Map(),
    );

    return new LessonHydrator({
      id,
      timeInterval,
      schoolId,
      teacherIds,
      createdAt,
      updatedAt,
    });
  }
}
