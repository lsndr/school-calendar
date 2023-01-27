import { Inject, Injectable } from '@nestjs/common';
import { KNEX_PROVIDER, UOW_PROVIDER } from '../../../shared/database';
import { Uow } from 'yuow';
import {
  AttendanceRepository,
  EmployeeRepository,
  OfficeRepository,
  VisitRepository,
} from '../../database';
import {
  Attendance,
  AttendanceId,
  Employee,
  ExactDate,
  TimeInterval,
} from '../../domain';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { CreateAttendanceDto } from './create-attendance.dto';
import { AttendanceDto } from './attendance.dto';
import { TimeIntervalDto } from '../visits/time-interval.dto';
import { UpdateAttendanceDto } from './update-attendance.dto';
import { AssignEmployeesDto } from './assign-employees.dto';
import { UnassignEmployeesDto } from './unassign-employees.dto';

@Injectable()
export class AttendancesService {
  constructor(
    @Inject(UOW_PROVIDER) private readonly uow: Uow,
    @Inject(KNEX_PROVIDER) private readonly knex: Knex,
  ) {}

  create(officeId: string, visitId: string, dto: CreateAttendanceDto) {
    return this.uow(async (ctx) => {
      const officeRepository = ctx.getRepository(OfficeRepository);
      const visitRepository = ctx.getRepository(VisitRepository);
      const employeeRepository = ctx.getRepository(EmployeeRepository);
      const attendanceRepository = ctx.getRepository(AttendanceRepository);

      const [office, visit, employees] = await Promise.all([
        officeRepository.findOne({
          id: officeId,
        }),
        visitRepository.findOne({
          id: visitId,
          officeId: officeId,
        }),
        employeeRepository.findMany({
          ids: dto.employeeIds,
          officeId: officeId,
        }),
      ]);

      if (!office) {
        throw new Error('Office not found');
      }

      if (!visit) {
        throw new Error('Visit not found');
      }

      const date = ExactDate.createFromISO(dto.date);
      const id = AttendanceId.create(visit.id, date);
      const timeInterval = TimeInterval.create(dto.timeInterval);
      const now = DateTime.now();

      const attendance = Attendance.create({
        id,
        office,
        timeInterval,
        now,
      });

      attendanceRepository.add(attendance);

      for (const employee of employees) {
        attendance.assignEmployee(employee, visit, office, now);
      }

      const employeeIds = Array.from(attendance.employeeIds).map(
        (id) => id.value,
      );

      return new AttendanceDto({
        visitId: attendance.id.visitId.value,
        date: attendance.id.date.toDateTime().toISODate(),
        employeeIds,
        timeInterval: new TimeIntervalDto(attendance.timeInterval),
        updatedAt: attendance.updatedAt.toISO(),
        createdAt: attendance.createdAt.toISO(),
      });
    });
  }

  update(
    officeId: string,
    visitId: string,
    date: string,
    dto: UpdateAttendanceDto,
  ) {
    return this.uow(async (ctx) => {
      const officeRepository = ctx.getRepository(OfficeRepository);
      const visitRepository = ctx.getRepository(VisitRepository);
      const employeeRepository = ctx.getRepository(EmployeeRepository);
      const attendanceRepository = ctx.getRepository(AttendanceRepository);

      const [attendance, office, visit, employees] = await Promise.all([
        attendanceRepository.findOne({
          id: {
            visitId,
            date,
          },
        }),
        officeRepository.findOne({
          id: officeId,
        }),
        visitRepository.findOne({
          id: visitId,
          officeId: officeId,
        }),
        employeeRepository.findMany({
          ids: dto.employeeIds,
          officeId: officeId,
        }),
      ]);

      if (!attendance) {
        throw new Error('Attendance not found');
      }

      if (!office) {
        throw new Error('Office not found');
      }

      if (!visit) {
        throw new Error('Visit not found');
      }

      const now = DateTime.now();

      if (dto.timeInterval !== undefined) {
        const timeInterval = TimeInterval.create(dto.timeInterval);
        attendance.setTimeInterval(timeInterval, now);
      }

      if (dto.employeeIds !== undefined) {
        const employeesMap = employees.reduce<Map<string, Employee>>(
          (map, employee) => {
            attendance.assignEmployee(employee, visit, office, now);

            return map.set(employee.id.value, employee);
          },
          new Map(),
        );

        for (const id of attendance.employeeIds) {
          if (employeesMap.has(id.value)) {
            continue;
          }

          attendance.unassignEmployee(id.value, office, now);
        }
      }

      const employeeIds = attendance.employeeIds.map((id) => id.value);

      return new AttendanceDto({
        visitId: attendance.id.visitId.value,
        date: attendance.id.date.toDateTime().toISODate(),
        employeeIds,
        timeInterval: new TimeIntervalDto(attendance.timeInterval),
        updatedAt: attendance.updatedAt.toISO(),
        createdAt: attendance.createdAt.toISO(),
      });
    });
  }

  assignEmployee(
    officeId: string,
    visitId: string,
    date: string,
    dto: AssignEmployeesDto,
  ) {
    return this.uow(async (ctx) => {
      const officeRepository = ctx.getRepository(OfficeRepository);
      const visitRepository = ctx.getRepository(VisitRepository);
      const employeeRepository = ctx.getRepository(EmployeeRepository);
      const attendanceRepository = ctx.getRepository(AttendanceRepository);

      const [attendance, office, visit, employees] = await Promise.all([
        attendanceRepository.findOne({
          id: {
            visitId,
            date,
          },
        }),
        officeRepository.findOne({
          id: officeId,
        }),
        visitRepository.findOne({
          id: visitId,
          officeId: officeId,
        }),
        employeeRepository.findMany({
          ids: dto.employeeIds,
          officeId: officeId,
        }),
      ]);

      if (!attendance) {
        throw new Error('Attendance not found');
      }

      if (!office) {
        throw new Error('Office not found');
      }

      if (!visit) {
        throw new Error('Visit not found');
      }

      const now = DateTime.now();

      for (const employee of employees) {
        attendance.assignEmployee(employee, visit, office, now);
      }

      const employeeIds = attendance.employeeIds.map((id) => id.value);

      return new AttendanceDto({
        visitId: attendance.id.visitId.value,
        date: attendance.id.date.toDateTime().toISODate(),
        employeeIds,
        timeInterval: new TimeIntervalDto(attendance.timeInterval),
        updatedAt: attendance.updatedAt.toISO(),
        createdAt: attendance.createdAt.toISO(),
      });
    });
  }

  unassignEmployee(
    officeId: string,
    visitId: string,
    date: string,
    dto: UnassignEmployeesDto,
  ) {
    return this.uow(async (ctx) => {
      const officeRepository = ctx.getRepository(OfficeRepository);
      const attendanceRepository = ctx.getRepository(AttendanceRepository);

      const [attendance, office] = await Promise.all([
        attendanceRepository.findOne({
          id: {
            visitId,
            date,
          },
          officeId,
        }),
        officeRepository.findOne({
          id: officeId,
        }),
      ]);

      if (!attendance) {
        throw new Error('Attendance not found');
      }

      if (!office) {
        throw new Error('Office not found');
      }

      const now = DateTime.now();

      for (const id of dto.employeeIds) {
        attendance.unassignEmployee(id, office, now);
      }

      const employeeIds = attendance.employeeIds.map((id) => id.value);

      return new AttendanceDto({
        visitId: attendance.id.visitId.value,
        date: attendance.id.date.toDateTime().toISODate(),
        employeeIds,
        timeInterval: new TimeIntervalDto(attendance.timeInterval),
        updatedAt: attendance.updatedAt.toISO(),
        createdAt: attendance.createdAt.toISO(),
      });
    });
  }

  async findOne(officeId: string, visitId: string, date: string) {
    const dateTime = DateTime.fromISO(date);

    const [attendanceRecord, employeeRecords] = await Promise.all([
      this.knex
        .select([
          'attendances.date',
          'attendances.visit_id',
          'attendances.starts_at',
          'attendances.duration',
          'attendances.created_at',
          'attendances.updated_at',
        ])
        .from('attendances')
        .innerJoin('visits', 'attendances.visit_id', 'visits.id')
        .where('attendances.visit_id', visitId)
        .where('visits.office_id', officeId)
        .where('attendances.date', dateTime.toSQLDate())
        .first(),
      this.knex
        .select('employee_id')
        .from('attendances_employees')
        .where('visit_id', visitId),
    ]);

    if (!attendanceRecord) {
      return;
    }

    const employeeIds = employeeRecords.map(
      (record: any) => record.employee_id,
    );

    return new AttendanceDto({
      employeeIds,
      visitId: attendanceRecord.visit_id,
      date: attendanceRecord.date.toISODate(),
      timeInterval: new TimeIntervalDto({
        startsAt: attendanceRecord.starts_at,
        duration: attendanceRecord.duration,
      }),
      updatedAt: attendanceRecord.updated_at.toISO(),
      createdAt: attendanceRecord.created_at.toISO(),
    });
  }
}
