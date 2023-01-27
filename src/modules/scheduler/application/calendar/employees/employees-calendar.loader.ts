import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { KNEX_PROVIDER } from '../../../../shared/database';
import {
  AttendancesLoader,
  AttendanceDates,
  Assignment,
} from './attendances.loader';
import { CalendarEmployeeEventDto } from './calendar-employee-event.dto';
import { CalendarEmployeeDto } from './calendar-employee.dto';
import { EmployeesCalendarDto } from './employees-calendar.dto';
import { VisitVersion, VisitVersionsLoader } from './visit-versions.loader';

export type EmployeesCalendarPeriod = {
  officeId: string;
  timeZone: string;
  from: DateTime;
  to: DateTime;
};

@Injectable()
export class EmployeesCalendarLoader {
  constructor(
    @Inject(KNEX_PROVIDER) private readonly knex: Knex,
    private readonly visitVersionsLoader: VisitVersionsLoader,
    private readonly attendancesLoader: AttendancesLoader,
  ) {}

  async forPeriod(
    period: EmployeesCalendarPeriod,
  ): Promise<EmployeesCalendarDto> {
    const [versionsIterator, employees] = await Promise.all([
      this.visitVersionsLoader.load(period),
      this.getEmployees(period.officeId),
    ]);

    const versions: VisitVersion[] = [];
    const attendancesDates = new Map<string, AttendanceDates>();

    for await (const version of versionsIterator) {
      const attendanceDates = attendancesDates.get(version.id) || {
        visitId: version.id,
        dates: [],
      };

      attendanceDates.dates.push(version.date);
      attendancesDates.set(version.id, attendanceDates);

      versions.push(version);
    }

    const assignmentsIterator = await this.attendancesLoader.load(
      period.timeZone,
      attendancesDates.values(),
    );

    const attendancesMap = new Map<string, Assignment>();

    for await (const assignment of assignmentsIterator) {
      attendancesMap.set(
        `${assignment.visitId}-${assignment.date.toSQLDate()}`,
        assignment,
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

      // если существует атенданс, то берем его время

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
    return await this.knex
      .select(['id', 'name'])
      .from('employees')
      .where('office_id', officeId);
  }
}
