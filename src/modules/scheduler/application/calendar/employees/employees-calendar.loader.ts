import { MikroORM } from '@mikro-orm/postgresql';
import { Inject, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { MIKROORM_PROVIDER } from '../../../../shared/database';
import { AttendancesLoader, Assignment } from './attendances.loader';
import { CalendarEmployeeEventDto } from './calendar-employee-event.dto';
import { CalendarEmployeeDto } from './calendar-employee.dto';
import { EmployeesCalendarDto } from './employees-calendar.dto';
import { VisitVersion, VisitVersionsLoader } from './visit-versions.loader';

export type EmployeesCalendarPeriodOptions = {
  officeId: string;
  timeZone: string;
  from: DateTime;
  to: DateTime;
};

@Injectable()
export class EmployeesCalendarLoader {
  constructor(
    private readonly visitVersionsLoader: VisitVersionsLoader,
    private readonly attendancesLoader: AttendancesLoader,
    @Inject(MIKROORM_PROVIDER)
    private readonly orm: MikroORM,
  ) {}

  async forPeriod(
    options: EmployeesCalendarPeriodOptions,
  ): Promise<EmployeesCalendarDto> {
    const [versionsIterator, employees, attendancesIterator] =
      await Promise.all([
        this.visitVersionsLoader.load(options),
        this.getEmployees(options.officeId),
        this.attendancesLoader.load(options),
      ]);

    const versions: VisitVersion[] = [];

    for await (const version of versionsIterator) {
      versions.push(version);
    }

    const attendancesMap = new Map<string, Assignment>();

    for await (const attendance of attendancesIterator) {
      attendancesMap.set(
        `${attendance.visitId}-${attendance.date.toSQLDate()}`,
        attendance,
      );
    }

    const events: CalendarEmployeeEventDto[] = [];

    for (const version of versions) {
      const attendance = attendancesMap.get(
        `${version.id}-${version.date.toSQLDate()}`,
      );

      const numberOfAssignedEmployees = attendance?.employeeIds.length || 0;
      const numberOfUnassignedEmployees =
        version.requiredEmployees - numberOfAssignedEmployees;

      const startsAt = version.date
        .startOf('day')
        .plus({
          minutes: attendance ? attendance.startsAt : version.startsAt,
        })
        .toISO();

      for (let i = 0; i < numberOfUnassignedEmployees; i++) {
        events.push({
          visitId: version.id,
          name: version.name,
          startsAt,
          duration: attendance ? attendance.duration : version.duration,
          assignedEmployees: numberOfAssignedEmployees,
          requiredEmployees: version.requiredEmployees,
        });
      }

      const employeeIds = attendance?.employeeIds || [];

      for (const employeeId of employeeIds) {
        events.push({
          visitId: version.id,
          name: version.name,
          startsAt,
          duration: attendance ? attendance.duration : version.duration,
          assignedEmployees: numberOfAssignedEmployees,
          requiredEmployees: version.requiredEmployees,
          employeeId,
        });
      }
    }

    return {
      events,
      employees,
    };
  }

  private async getEmployees(officeId: string): Promise<CalendarEmployeeDto[]> {
    const knex = this.orm.em.getConnection().getKnex();

    return await knex
      .select(['id', 'name'])
      .from('employee')
      .where('office_id', officeId);
  }
}
