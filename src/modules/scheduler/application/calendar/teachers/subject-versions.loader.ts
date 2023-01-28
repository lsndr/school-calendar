import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { KNEX_PROVIDER } from '../../../../shared/database';
import { extractDatesFromPeriodicity } from './helpers';

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
  constructor(@Inject(KNEX_PROVIDER) private readonly knex: Knex) {}

  async load(
    options: SubjectVersionsLoaderOptions,
  ): Promise<Generator<SubjectVersion>> {
    const handledVersions = new Set<string>();

    const subjects = await this.knex
      .select('*')
      .from(
        this.knex
          .select([
            'subjects.id',
            'subjects.group_id',
            'subjects.name',
            'subjects.time_starts_at',
            'subjects.periodicity_type',
            'subjects.periodicity_data',
            'subjects.time_duration',
            'subjects.required_teachers',
            'subjects.created_at as active_since',
            this.knex.raw(
              'LEAD(subjects_log.created_at) OVER (PARTITION BY subjects_log.subject_id ORDER BY subjects_log.created_at ASC) as active_till',
            ),
            'subjects.created_at',
          ])
          .innerJoin('subjects_log', 'subjects_log.subject_id', 'subjects.id')
          .from('subjects')
          .where('subjects.school_id', options.schoolId)
          .as('versions'),
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
          });
      })
      .orderBy('active_since', 'desc');

    return (function* () {
      for (const subject of subjects) {
        const periodicity = {
          type: subject.periodicity_type,
          ...subject.periodicity_data,
        };

        const calculateSince = subject.created_at
          .setZone(options.timeZone)
          .startOf('day');
        const calculateTill = subject.active_till
          ? subject.active_till.setZone(options.timeZone).endOf('day')
          : null;

        // Если active_since больше from, то юзать active_since,
        // так как в выборку могу попасть лишние даты.

        const datesFrom = (
          subject.active_since.toMillis() > options.from.toMillis()
            ? subject.active_since
            : options.from
        )
          .setZone(options.timeZone)
          .startOf('day');
        const datesTo = options.to;

        // Генерим нужные нам даты.

        const dates = extractDatesFromPeriodicity(datesFrom, datesTo, {
          timeZone: options.timeZone,
          calculateSince,
          calculateTill,
          periodicity,
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
