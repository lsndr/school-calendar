import { MikroORM } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

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
  constructor(private readonly orm: MikroORM) {}

  async load(
    options: AttendancesLoaderOptions,
  ): Promise<Generator<Assignment>> {
    const knex = this.orm.em.getConnection().getKnex();

    const attendances = await knex
      .select([
        'attendance.visit_id',
        'attendance.time_starts_at',
        'attendance.time_duration',
        'attendance.date',
        knex
          .select(knex.raw('ARRAY_AGG(attendance_employee.employee_id)'))
          .from('attendance_employee')
          .whereRaw('attendance_employee.attendance_id = attendance.id')
          .as('employee_ids'),
      ])
      .from('attendance')
      .where(
        'attendance.date',
        '>=',
        options.from.setZone(options.timeZone).toSQLDate(),
      )
      .andWhere(
        'attendance.date',
        '<',
        options.to.setZone(options.timeZone).toSQLDate(),
      )
      .andWhere('attendance.office_id', options.officeId);

    return (function* () {
      for (const attendance of attendances) {
        yield {
          visitId: attendance.visit_id,
          startsAt: attendance.time_starts_at,
          duration: attendance.time_duration,
          date: DateTime.fromSQL(attendance.date).setZone(options.timeZone, {
            keepLocalTime: true,
          }),
          employeeIds: attendance.employee_ids,
        };
      }
    })();
  }
}
