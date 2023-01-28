import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { KNEX_PROVIDER } from '../../../../shared/database';
import { extractDatesFromPeriodicity } from './helpers';

export type VisitVersionsLoaderOptions = {
  officeId: string;
  timeZone: string;
  from: DateTime;
  to: DateTime;
};

export type VisitVersion = {
  id: string;
  clientId: string;
  name: string;
  startsAt: number;
  duration: number;
  requiredEmployees: number;
  date: DateTime;
};

@Injectable()
export class VisitVersionsLoader {
  constructor(@Inject(KNEX_PROVIDER) private readonly knex: Knex) {}

  async load(
    options: VisitVersionsLoaderOptions,
  ): Promise<Generator<VisitVersion>> {
    const handledVersions = new Set<string>();

    const visits = await this.knex
      .select('*')
      .from(
        this.knex
          .select([
            'visits.id',
            'visits.client_id',
            'visits_log.name',
            'visits_log.starts_at',
            'visits_log.periodicity_type',
            'visits_log.periodicity_data',
            'visits_log.duration',
            'visits_log.required_employees',
            'visits_log.created_at as active_since',
            this.knex.raw(
              'LEAD(visits_log.created_at) OVER (PARTITION BY visits_log.visit_id ORDER BY visits_log.created_at ASC) as active_till',
            ),
            'visits.created_at',
          ])
          .innerJoin('visits_log', 'visits_log.visit_id', 'visits.id')
          .from('visits')
          .where('visits.office_id', options.officeId)
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
      for (const visit of visits) {
        const periodicity = {
          type: visit.periodicity_type,
          ...visit.periodicity_data,
        };

        const calculateSince = visit.created_at
          .setZone(options.timeZone)
          .startOf('day');
        const calculateTill = visit.active_till
          ? visit.active_till.setZone(options.timeZone).endOf('day')
          : null;

        // Если active_since больше from, то юзать active_since,
        // так как в выборку могу попасть лишние даты.

        const datesFrom = (
          visit.active_since.toMillis() > options.from.toMillis()
            ? visit.active_since
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
          const activeSince = visit.active_since;
          const start = date
            .setZone(options.timeZone)
            .startOf('day')
            .plus({ minutes: visit.starts_at });

          const key = `${visit.id}-${start.toISODate()}`;

          if (
            !handledVersions.has(key) &&
            start.toMillis() >= activeSince.toMillis()
          ) {
            handledVersions.add(key);

            yield {
              id: visit.id,
              clientId: visit.client_id,
              requiredEmployees: visit.required_employees,
              name: visit.name,
              startsAt: visit.starts_at,
              duration: visit.duration,
              date,
            };
          }
        }
      }
    })();
  }
}
