import { MikroORM } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { extractDatesFromPeriodicity } from '../../domain';

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
  constructor(private readonly orm: MikroORM) {}

  async load(
    options: VisitVersionsLoaderOptions,
  ): Promise<Generator<VisitVersion>> {
    const knex = this.orm.em.getConnection().getKnex();
    const handledVersions = new Set<string>();

    const visits = await knex
      .select('*')
      .from(
        knex
          .select([
            'visit.id',
            'visit.client_id',
            'visit_log.name',
            'visit_log.time_starts_at',
            'visit_log.recurrence_type',
            'visit_log.recurrence_week1',
            'visit_log.recurrence_week2',
            'visit_log.recurrence_days',
            'visit_log.time_duration',
            'visit_log.required_employees',
            'visit_log.created_at as active_since',
            knex.raw(
              'LEAD(visit_log.created_at) OVER (PARTITION BY visit_log.visit_id ORDER BY visit_log.created_at ASC) as active_till',
            ),
            'visit.created_at',
          ])
          .innerJoin('visit_log', 'visit_log.visit_id', 'visit.id')
          .from('visit')
          .where('visit.office_id', options.officeId)
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
      for (const visit of visits) {
        const recurence = {
          type: visit.recurrence_type,
          days: visit.recurrence_days,
          week1: visit.recurrence_week1,
          week2: visit.recurrence_week2,
        };

        const calculateSince = visit.created_at
          .setZone(options.timeZone)
          .startOf('day');
        const calculateTill = visit.active_till
          ? visit.active_till.setZone(options.timeZone).endOf('day')
          : null;

        const datesFrom = (
          visit.active_since.toMillis() > options.from.toMillis()
            ? visit.active_since
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
          const activeSince = visit.active_since;
          const start = date
            .setZone(options.timeZone)
            .startOf('day')
            .plus({ minutes: visit.time_starts_at });

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
              startsAt: visit.time_starts_at,
              duration: visit.time_duration,
              date,
            };
          }
        }
      }
    })();
  }
}
