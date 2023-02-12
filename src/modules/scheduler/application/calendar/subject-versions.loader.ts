import { MikroORM } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { extractDatesFromPeriodicity } from '../../domain';

export type SubjectVersionsLoaderOptions = {
  schoolId: string;
  timeZone: string;
  from: DateTime;
  to: DateTime;
};

export type SubjectVersion = {
  id: string;
  groupId: string;
  name: string;
  startsAt: number;
  duration: number;
  requiredTeachers: number;
  date: DateTime;
};

@Injectable()
export class SubjectVersionsLoader {
  constructor(private readonly orm: MikroORM) {}

  async load(
    options: SubjectVersionsLoaderOptions,
  ): Promise<Generator<SubjectVersion>> {
    const knex = this.orm.em.getConnection().getKnex();
    const handledVersions = new Set<string>();

    const subjects = await knex
      .select('*')
      .from(
        knex
          .select([
            'subject.id',
            'subject.group_id',
            'subject_log.name',
            'subject_log.time_starts_at',
            'subject_log.recurrence_type',
            'subject_log.recurrence_week1',
            'subject_log.recurrence_week2',
            'subject_log.recurrence_days',
            'subject_log.time_duration',
            'subject_log.required_teachers',
            'subject_log.created_at as active_since',
            knex.raw(
              'LEAD(subject_log.created_at) OVER (PARTITION BY subject_log.subject_id ORDER BY subject_log.created_at ASC) as active_till',
            ),
            'subject.created_at',
          ])
          .innerJoin('subject_log', 'subject_log.subject_id', 'subject.id')
          .from('subject')
          .where('subject.school_id', options.schoolId)
          .as('version'),
      )
      .where((query1) => {
        query1
          .where((query2) => {
            query2
              .where('active_since', '>=', options.from.toUTC().toSQL())
              .andWhere('active_since', '<', options.to.toUTC().toSQL());
          })
          .orWhere((query2) => {
            query2
              .where('active_till', '>=', options.from.toUTC().toSQL())
              .andWhere('active_till', '<', options.to.toUTC().toSQL());
          })
          .orWhere((query2) => {
            query2
              .whereNull('active_till')
              .andWhere('active_since', '<', options.to.toUTC().toSQL());
          });
      })
      .orderBy('active_since', 'desc');

    return (function* () {
      for (const subject of subjects) {
        const recurence = {
          type: subject.recurrence_type,
          days: subject.recurrence_days,
          week1: subject.recurrence_week1,
          week2: subject.recurrence_week2,
        };

        const calculateSince = subject.created_at
          .setZone(options.timeZone)
          .startOf('day');
        const calculateTill = subject.active_till
          ? subject.active_till.setZone(options.timeZone).endOf('day')
          : null;

        const datesFrom = (
          subject.active_since.toMillis() > options.from.toMillis()
            ? subject.active_since
            : options.from
        )
          .setZone(options.timeZone)
          .startOf('day');
        const datesTo = options.to;

        const dates = extractDatesFromPeriodicity(datesFrom, datesTo, {
          timeZone: options.timeZone,
          calculateSince,
          calculateTill,
          recurence,
        });

        for (const date of dates) {
          const activeSince = subject.active_since;
          const start = date
            .setZone(options.timeZone)
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
