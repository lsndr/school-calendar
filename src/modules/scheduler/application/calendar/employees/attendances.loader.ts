import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { KNEX_PROVIDER } from '../../../../shared/database';

export type AttendancesLoaderOptions = {
  officeId: string;
  timeZone: string;
  from: DateTime;
  to: DateTime;
};

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
    options: AttendancesLoaderOptions,
  ): Promise<Generator<Assignment>> {
    const attendances = await this.knex
      .select([
        'attendances.visit_id',
        'attendances.time_starts_at',
        'attendances.time_duration',
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
      .from('attendances')
      .where(
        'attendances.date',
        '>=',
        options.from.setZone(options.timeZone).toSQLDate(),
      )
      .andWhere(
        'attendances.date',
        '<',
        options.to.setZone(options.timeZone).toSQLDate(),
      )
      .andWhere('attendances.office_id', options.officeId);

    return (function* () {
      for (const attendance of attendances) {
        yield {
          visitId: attendance.visit_id,
          startsAt: attendance.time_starts_at,
          duration: attendance.time_duration,
          date: attendance.date.setZone(options.timeZone, {
            keepLocalTime: true,
          }),
          employeeIds: attendance.employee_ids,
        };
      }
    })();
  }
}
