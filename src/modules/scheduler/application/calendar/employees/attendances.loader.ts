import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { KNEX_PROVIDER } from '../../../../shared/database';

export type AttendanceDates = {
  visitId: string;
  dates: DateTime[];
};

export type Assignment = {
  visitId: string;
  startsAt: number;
  duration: number;
  employeeIds: string[];
  date: DateTime;
};

@Injectable()
export class AttendancesLoader {
  constructor(@Inject(KNEX_PROVIDER) private readonly knex: Knex) {}

  async load(
    timeZone: string,
    visitDates: Iterable<AttendanceDates>,
  ): Promise<Generator<Assignment>> {
    const assignmentsQuery = this.knex
      .select([
        'attendances.visit_id',
        'attendances.starts_at',
        'attendances.duration',
        'attendances.date',
        this.knex
          .select(this.knex.raw('ARRAY_AGG(attendances_employees.employee_id)'))
          .from('attendances_employees')
          .whereRaw('attendances_employees.visit_id = attendances.visit_id')
          .andWhereRaw('attendances_employees.date = attendances.date')
          .groupBy(
            'attendances_employees.visit_id',
            'attendances_employees.date',
          )
          .as('employee_ids'),
      ])
      .from('attendances');

    assignmentsQuery.where((query1) => {
      for (const visitDate of visitDates) {
        query1.orWhere((query2) => {
          query2.where('attendances.visit_id', visitDate.visitId).whereIn(
            'attendances.date',
            visitDate.dates.map((date) => date.setZone(timeZone).toSQLDate()),
          );
        });
      }
    });

    const assignments = await assignmentsQuery;

    return (function* () {
      for (const assignment of assignments) {
        yield {
          visitId: assignment.visit_id,
          startsAt: assignment.starts_at,
          duration: assignment.duration,
          date: assignment.date.setZone(timeZone, { keepLocalTime: true }),
          employeeIds: assignment.employee_ids,
        };
      }
    })();
  }
}
