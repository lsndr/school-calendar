import { Injectable } from '@nestjs/common';
import {
  Attendance,
  AttendanceId,
  Employee,
  ExactDate,
  Office,
  TimeInterval,
  Visit,
} from '../../domain';
import { DateTime } from 'luxon';
import { CreateAttendanceDto } from './create-attendance.dto';
import { AttendanceDto } from './attendance.dto';
import { TimeIntervalDto } from '../visits/time-interval.dto';
import { UpdateAttendanceDto } from './update-attendance.dto';
import { AssignEmployeesDto } from './assign-employees.dto';
import { UnassignEmployeesDto } from './unassign-employees.dto';
import { MikroORM } from '@mikro-orm/postgresql';
import { AssignedEmployeeDto } from './assigned-employee.dto';

@Injectable()
export class AttendancesService {
  constructor(private readonly orm: MikroORM) {}

  async create(officeId: string, visitId: string, dto: CreateAttendanceDto) {
    const em = this.orm.em.fork();

    const officeRepository = em.getRepository(Office);
    const visitRepository = em.getRepository(Visit);
    const employeeRepository = em.getRepository(Employee);
    const attendanceRepository = em.getRepository(Attendance);

    const [office, visit, employees] = await Promise.all([
      officeRepository
        .createQueryBuilder()
        .where({ id: officeId })
        .getSingleResult(),
      visitRepository
        .createQueryBuilder()
        .where({ id: visitId, office_id: officeId })
        .getSingleResult(),
      employeeRepository
        .createQueryBuilder()
        .where({ id: { $in: dto.employeeIds }, office_id: officeId })
        .getResult(),
    ]);

    if (!office) {
      throw new Error('Office not found');
    }

    if (!visit) {
      throw new Error('Visit not found');
    }

    const id = AttendanceId.create();
    const date = ExactDate.createFromISO(dto.date);
    const time = TimeInterval.create(dto.time);
    const now = DateTime.now();

    const attendance = Attendance.create({
      id,
      date,
      visit,
      office,
      time,
      now,
    });

    for (const employee of employees) {
      attendance.assignEmployee(employee, visit, office, now);
    }

    await attendanceRepository.persistAndFlush(attendance);

    const assignedEmployees = attendance.assignedEmployees.map((employee) => ({
      employeeId: employee.employeeId.value,
      assignedAt: employee.assignedAt.toISO(),
    }));

    return new AttendanceDto({
      visitId: attendance.visitId.value,
      date: attendance.date.toDateTime().toISODate(),
      assignedEmployees,
      time: new TimeIntervalDto(attendance.time),
      updatedAt: attendance.updatedAt.toISO(),
      createdAt: attendance.createdAt.toISO(),
    });
  }

  async update(
    officeId: string,
    visitId: string,
    date: string,
    dto: UpdateAttendanceDto,
  ) {
    const em = this.orm.em.fork();

    const officeRepository = em.getRepository(Office);
    const visitRepository = em.getRepository(Visit);
    const employeeRepository = em.getRepository(Employee);
    const attendanceRepository = em.getRepository(Attendance);

    const [attendance, office, visit, employees] = await Promise.all([
      attendanceRepository
        .createQueryBuilder()
        .where({
          visitId,
          date,
          officeId,
        })
        .getSingleResult(),
      officeRepository
        .createQueryBuilder()
        .where({ id: officeId })
        .getSingleResult(),
      visitRepository
        .createQueryBuilder()
        .where({ id: visitId, officeId: officeId })
        .getSingleResult(),
      employeeRepository
        .createQueryBuilder()
        .where({ id: { $in: dto.employeeIds }, officeId: officeId })
        .getResult(),
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

    if (dto.time !== undefined) {
      const time = TimeInterval.create(dto.time);
      attendance.setTime(time, now);
    }

    if (dto.employeeIds !== undefined) {
      const employeesMap = employees.reduce<Map<string, Employee>>(
        (map, employee) => {
          attendance.assignEmployee(employee, visit, office, now);

          return map.set(employee.id.value, employee);
        },
        new Map(),
      );

      for (const employee of attendance.assignedEmployees) {
        if (employeesMap.has(employee.employeeId.value)) {
          continue;
        }

        attendance.unassignEmployee(employee.employeeId.value, office, now);
      }
    }

    const assignedEmployees = attendance.assignedEmployees.map((employee) => ({
      employeeId: employee.employeeId.value,
      assignedAt: employee.assignedAt.toISO(),
    }));

    return new AttendanceDto({
      visitId: attendance.visitId.value,
      date: attendance.date.toDateTime().toISODate(),
      assignedEmployees,
      time: new TimeIntervalDto(attendance.time),
      updatedAt: attendance.updatedAt.toISO(),
      createdAt: attendance.createdAt.toISO(),
    });
  }

  async assignEmployees(
    officeId: string,
    visitId: string,
    date: string,
    dto: AssignEmployeesDto,
  ) {
    const em = this.orm.em.fork();

    const officeRepository = em.getRepository(Office);
    const visitRepository = em.getRepository(Visit);
    const employeeRepository = em.getRepository(Employee);
    const attendanceRepository = em.getRepository(Attendance);

    const [attendance, office, visit, employees] = await Promise.all([
      attendanceRepository
        .createQueryBuilder()
        .where({
          visitId,
          date,
          officeId,
        })
        .getSingleResult(),
      officeRepository
        .createQueryBuilder()
        .where({ id: officeId })
        .getSingleResult(),
      visitRepository
        .createQueryBuilder()
        .where({ id: visitId, officeId: officeId })
        .getSingleResult(),
      employeeRepository
        .createQueryBuilder()
        .where({ id: { $in: dto.employeeIds }, officeId: officeId })
        .getResult(),
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

    await em.flush();

    return attendance.assignedEmployees.map(
      (ae) =>
        new AssignedEmployeeDto({
          employeeId: ae.employeeId.value,
          assignedAt: ae.assignedAt.toISO(),
        }),
    );
  }

  async unassignEmployee(
    officeId: string,
    visitId: string,
    date: string,
    dto: UnassignEmployeesDto,
  ) {
    const em = this.orm.em.fork();

    const officeRepository = em.getRepository(Office);
    const attendanceRepository = em.getRepository(Attendance);

    const [attendance, office] = await Promise.all([
      attendanceRepository
        .createQueryBuilder()
        .where({
          visitId,
          date,
          officeId,
        })
        .getSingleResult(),
      officeRepository
        .createQueryBuilder()
        .where({ id: officeId })
        .getSingleResult(),
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

    const assignedEmployees = attendance.assignedEmployees.map((employee) => ({
      employeeId: employee.employeeId.value,
      assignedAt: employee.assignedAt.toISO(),
    }));

    return new AttendanceDto({
      visitId: attendance.visitId.value,
      date: attendance.date.toDateTime().toISODate(),
      assignedEmployees,
      time: new TimeIntervalDto(attendance.time),
      updatedAt: attendance.updatedAt.toISO(),
      createdAt: attendance.createdAt.toISO(),
    });
  }

  async findOne(officeId: string, visitId: string, date: string) {
    const knex = this.orm.em.getConnection().getKnex();

    const attendanceRecord = await knex
      .select([
        'attendance.date',
        'attendance.visit_id',
        'attendance.time_starts_at',
        'attendance.time_duration',
        'attendance.created_at',
        'attendance.updated_at',
        knex
          .select(
            knex.raw(
              `ARRAY_AGG(json_build_object('employee_id', attendance_employee.employee_id, 'assigned_at', attendance_employee.assigned_at))`,
            ),
          )
          .from('attendance_employee')
          .whereRaw('attendance_employee.attendance_id = attendance.id')
          .as('assigned_employees'),
      ])
      .from('attendance')
      .where('attendance.visit_id', visitId)
      .where('attendance.office_id', officeId)
      .where('attendance.date', date)
      .first();

    if (!attendanceRecord) {
      return;
    }

    const assignedEmployees = (attendanceRecord.assigned_employees || []).map(
      (employee: any) => ({
        employeeId: employee.employee_id,
        assignedAt: DateTime.fromISO(employee.assigned_at).toISO(),
      }),
    );

    return new AttendanceDto({
      assignedEmployees,
      visitId: attendanceRecord.visit_id,
      date: attendanceRecord.date.toISODate(),
      time: new TimeIntervalDto({
        startsAt: attendanceRecord.time_starts_at,
        duration: attendanceRecord.time_duration,
      }),
      updatedAt: attendanceRecord.updated_at.toISO(),
      createdAt: attendanceRecord.created_at.toISO(),
    });
  }
}
