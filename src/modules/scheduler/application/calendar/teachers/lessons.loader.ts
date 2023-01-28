import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { KNEX_PROVIDER } from '../../../../shared/database';

export type LessonsLoaderOptions = {
  schoolId: string;
  timeZone: string;
  from: DateTime;
  to: DateTime;
};

export type LessonDates = {
  subjectId: string;
  dates: DateTime[];
};

export type Assignment = {
  subjectId: string;
  startsAt: number;
  duration: number;
  teacherIds: string[];
  date: DateTime;
};

@Injectable()
export class LessonsLoader {
  constructor(@Inject(KNEX_PROVIDER) private readonly knex: Knex) {}

  async load(options: LessonsLoaderOptions): Promise<Generator<Assignment>> {
    const lessons = await this.knex
      .select([
        'lessons.subject_id',
        'lessons.starts_at',
        'lessons.duration',
        'lessons.date',
        this.knex
          .select(this.knex.raw('ARRAY_AGG(lessons_teachers.teacher_id)'))
          .from('lessons_teachers')
          .whereRaw('lessons_teachers.subject_id = lessons.subject_id')
          .andWhereRaw('lessons_teachers.date = lessons.date')
          .groupBy('lessons_teachers.subject_id', 'lessons_teachers.date')
          .as('teacher_ids'),
      ])
      .from('lessons')
      .where(
        'lessons.date',
        '>=',
        options.from.setZone(options.timeZone).toSQLDate(),
      )
      .andWhere(
        'lessons.date',
        '<',
        options.to.setZone(options.timeZone).toSQLDate(),
      )
      .andWhere('lessons.school_id', options.schoolId);

    return (function* () {
      for (const lesson of lessons) {
        yield {
          subjectId: lesson.subject_id,
          startsAt: lesson.starts_at,
          duration: lesson.duration,
          date: lesson.date.setZone(options.timeZone, {
            keepLocalTime: true,
          }),
          teacherIds: lesson.teacher_ids,
        };
      }
    })();
  }
}
