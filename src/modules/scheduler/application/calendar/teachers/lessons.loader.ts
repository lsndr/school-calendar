import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { KNEX_PROVIDER } from '../../../../shared/database';

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

  async load(
    timeZone: string,
    subjectDates: Iterable<LessonDates>,
  ): Promise<Generator<Assignment>> {
    const assignmentsQuery = this.knex
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
      .from('lessons');

    assignmentsQuery.where((query1) => {
      for (const subjectDate of subjectDates) {
        query1.orWhere((query2) => {
          query2.where('lessons.subject_id', subjectDate.subjectId).whereIn(
            'lessons.date',
            subjectDate.dates.map((date) => date.setZone(timeZone).toSQLDate()),
          );
        });
      }
    });

    const assignments = await assignmentsQuery;

    return (function* () {
      for (const assignment of assignments) {
        yield {
          subjectId: assignment.subject_id,
          startsAt: assignment.starts_at,
          duration: assignment.duration,
          date: assignment.date.setZone(timeZone, { keepLocalTime: true }),
          teacherIds: assignment.teacher_ids,
        };
      }
    })();
  }
}
