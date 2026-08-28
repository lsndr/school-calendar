import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

export interface LessonsLoaderOptions {
  schoolId: string;
  timeZone: string;
  from: DateTime;
  to: DateTime;
}

export interface LessonDates {
  subjectId: string;
  dates: DateTime[];
}

export interface Assignment {
  subjectId: string;
  startsAt: number;
  duration: number;
  teacherIds: string[];
  date: DateTime;
}

interface LessonRow {
  subject_id: string;
  time_starts_at: number;
  time_duration: number;
  date: Date;
  teacher_ids: string[] | null;
}

@Injectable()
export class LessonsLoader {
  public constructor(private readonly prisma: PrismaClient) {}

  public async load(
    options: LessonsLoaderOptions,
  ): Promise<Generator<Assignment>> {
    const fromDate = options.from.setZone(options.timeZone).toSQLDate();
    const toDate = options.to.setZone(options.timeZone).toSQLDate();

    const lessons = await this.prisma.$queryRaw<LessonRow[]>`
      SELECT
        lesson.subject_id,
        lesson.time_starts_at,
        lesson.time_duration,
        lesson.date,
        ARRAY_AGG(lesson_teacher.teacher_id) FILTER (WHERE lesson_teacher.teacher_id IS NOT NULL) AS teacher_ids
      FROM lesson
      LEFT JOIN lesson_teacher ON lesson_teacher.lesson_id = lesson.id
      WHERE lesson.date >= ${fromDate}::date
        AND lesson.date < ${toDate}::date
        AND lesson.school_id = ${options.schoolId}
      GROUP BY lesson.id, lesson.subject_id, lesson.time_starts_at, lesson.time_duration, lesson.date
      ORDER BY lesson.date ASC
    `;

    const timeZone = options.timeZone;

    return (function* () {
      for (const lesson of lessons) {
        const dateUtc = lesson.date;

        yield {
          subjectId: lesson.subject_id,
          startsAt: lesson.time_starts_at,
          duration: lesson.time_duration,
          date: DateTime.fromObject(
            {
              year: dateUtc.getUTCFullYear(),
              month: dateUtc.getUTCMonth() + 1,
              day: dateUtc.getUTCDate(),
            },
            { zone: timeZone },
          ),
          teacherIds: lesson.teacher_ids ?? [],
        };
      }
    })();
  }
}
