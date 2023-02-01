import { MikroORM } from '@mikro-orm/postgresql';
import { Inject, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

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
  constructor(private readonly orm: MikroORM) {}

  async load(options: LessonsLoaderOptions): Promise<Generator<Assignment>> {
    const knex = this.orm.em.getConnection().getKnex();

    const lessons = await knex
      .select([
        'lesson.subject_id',
        'lesson.time_starts_at',
        'lesson.time_duration',
        'lesson.date',
        knex
          .select(knex.raw('ARRAY_AGG(lesson_teacher.teacher_id)'))
          .from('lesson_teacher')
          .whereRaw('lesson_teacher.lesson_id = lesson.id')
          .as('teacher_ids'),
      ])
      .from('lesson')
      .where(
        'lesson.date',
        '>=',
        options.from.setZone(options.timeZone).toSQLDate(),
      )
      .andWhere(
        'lesson.date',
        '<',
        options.to.setZone(options.timeZone).toSQLDate(),
      )
      .andWhere('lesson.school_id', options.schoolId);

    return (function* () {
      for (const lesson of lessons) {
        yield {
          subjectId: lesson.subject_id,
          startsAt: lesson.time_starts_at,
          duration: lesson.time_duration,
          date: DateTime.fromSQL(lesson.date).setZone(options.timeZone, {
            keepLocalTime: true,
          }),
          teacherIds: lesson.teacher_ids,
        };
      }
    })();
  }
}
