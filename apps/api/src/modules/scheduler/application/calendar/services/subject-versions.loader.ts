import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { extractDatesFromRecurrence } from '../../../domain';

export interface SubjectVersionsLoaderOptions {
  schoolId: string;
  timeZone: string;
  from: DateTime;
  to: DateTime;
}

export interface SubjectVersion {
  id: string;
  groupId: string;
  name: string;
  startsAt: number;
  duration: number;
  requiredTeachers: number;
  date: DateTime;
}

interface SubjectVersionRow {
  id: string;
  group_id: string;
  name: string;
  time_starts_at: number;
  recurrence_type: string;
  recurrence_week1: number[] | null;
  recurrence_week2: number[] | null;
  recurrence_days: number[] | null;
  time_duration: number;
  required_teachers: number;
  active_since: Date;
  active_till: Date | null;
  created_at: Date;
}

@Injectable()
export class SubjectVersionsLoader {
  public constructor(private readonly prisma: PrismaClient) {}

  public async load(
    options: SubjectVersionsLoaderOptions,
  ): Promise<Generator<SubjectVersion>> {
    const fromSql = options.from.toUTC().toSQL();
    const toSql = options.to.toUTC().toSQL();

    const subjects = await this.prisma.$queryRaw<SubjectVersionRow[]>`
      SELECT *
      FROM (
        SELECT
          subject.id,
          subject.group_id,
          subject_log.name,
          subject_log.time_starts_at,
          subject_log.recurrence_type,
          subject_log.recurrence_week1,
          subject_log.recurrence_week2,
          subject_log.recurrence_days,
          subject_log.time_duration,
          subject_log.required_teachers,
          subject_log.created_at AS active_since,
          LEAD(subject_log.created_at) OVER (
            PARTITION BY subject_log.subject_id
            ORDER BY subject_log.created_at ASC
          ) AS active_till,
          subject.created_at
        FROM subject
        INNER JOIN subject_log ON subject_log.subject_id = subject.id
        WHERE subject.school_id = ${options.schoolId}
      ) version
      WHERE (
        (active_since >= ${fromSql}::timestamptz AND active_since < ${toSql}::timestamptz)
        OR (active_till >= ${fromSql}::timestamptz AND active_till < ${toSql}::timestamptz)
        OR (active_till IS NULL AND active_since < ${toSql}::timestamptz)
      )
      ORDER BY active_since DESC
    `;

    const handledVersions = new Set<string>();
    const timeZone = options.timeZone;
    const optionsFrom = options.from;
    const optionsTo = options.to;

    return (function* () {
      for (const subject of subjects) {
        const recurrence = {
          type: subject.recurrence_type,
          days: subject.recurrence_days,
          week1: subject.recurrence_week1,
          week2: subject.recurrence_week2,
        } as any;

        const activeSince = DateTime.fromJSDate(subject.active_since);
        const activeTill = subject.active_till
          ? DateTime.fromJSDate(subject.active_till)
          : null;
        const subjectCreatedAt = DateTime.fromJSDate(subject.created_at);

        const calculateSince = subjectCreatedAt
          .setZone(timeZone)
          .startOf('day');
        const calculateTill = activeTill
          ? activeTill.setZone(timeZone).endOf('day')
          : undefined;

        const datesFrom = (
          activeSince.toMillis() > optionsFrom.toMillis()
            ? activeSince
            : optionsFrom
        )
          .setZone(timeZone)
          .startOf('day');
        const datesTo = optionsTo;

        const dates = extractDatesFromRecurrence(datesFrom, datesTo, {
          timeZone,
          calculateSince,
          calculateTill,
          recurrence,
        });

        for (const date of dates) {
          const start = date
            .setZone(timeZone)
            .startOf('day')
            .plus({ minutes: subject.time_starts_at });

          const key = `${subject.id}-${start.toISODate()}`;

          if (
            !handledVersions.has(key) &&
            start.toMillis() >= activeSince.toMillis()
          ) {
            handledVersions.add(key);

            yield {
              id: subject.id,
              groupId: subject.group_id,
              requiredTeachers: subject.required_teachers,
              name: subject.name,
              startsAt: subject.time_starts_at,
              duration: subject.time_duration,
              date,
            };
          }
        }
      }
    })();
  }
}
