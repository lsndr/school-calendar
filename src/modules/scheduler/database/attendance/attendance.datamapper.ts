import { DataMapper } from 'yuow';
import { Attendance, EmployeeId } from '../../domain';
import { EmployeeIdHydrator } from '../employee/employee-id.hydrator';
import { OfficeIdHydrator } from '../office';
import { TimeIntervalHydartor } from '../visit/time-interval.hydrator';
import { AttendanceIdHydrator } from './attendance-id.hydrator';
import { AttendanceHydrator } from './attendance.hydrator';
import { ExactDateHydrator } from './exact-date.hydrator';

export interface FindOneAttendanceQuery {
  id?: {
    visitId: string;
    date: string;
  };
  officeId?: string;
}

export class AttendanceDataMapper extends DataMapper<Attendance> {
  async findOne(query: FindOneAttendanceQuery) {
    const recordQuery = this.knex
      .select([
        'visit_id',
        'date',
        'office_id',
        'starts_at',
        'duration',
        'version',
        'created_at',
        'updated_at',
      ])
      .from('attendances');

    if (typeof query.id !== 'undefined') {
      recordQuery
        .where('visit_id', query.id.visitId)
        .andWhere('date', query.id.date);
    }

    if (typeof query.officeId !== 'undefined') {
      recordQuery.where('office_id', query.officeId);
    }

    const record = await recordQuery.first();

    if (!record) {
      return;
    }

    const employeeRecords = await this.knex
      .select('employee_id')
      .from('attendances_employees')
      .where('visit_id', record.visit_id)
      .andWhere('date', record.date);

    const attendance = this.map(record, employeeRecords);
    this.setVersion(attendance, record.version);

    return attendance;
  }

  async insert(attendance: Attendance): Promise<boolean> {
    return this.upsert(attendance);
  }

  async update(attendance: Attendance): Promise<boolean> {
    return this.upsert(attendance);
  }

  private async upsert(attendance: Attendance): Promise<boolean> {
    const version = this.increaseVersion(attendance);

    const attendanceQuery = this.knex
      .insert({
        visit_id: attendance.id.visitId.value,
        office_id: attendance.officeId.value,
        date: attendance.id.date.toDateTime().toSQL(),
        starts_at: attendance.timeInterval.startsAt,
        duration: attendance.timeInterval.duration,
        updated_at: attendance.updatedAt.toUTC().toSQL(),
        created_at: attendance.createdAt.toUTC().toSQL(),
        version,
      })
      .into('attendances')
      .onConflict(['visit_id', 'date'])
      .merge()
      .where('attendances.visit_id', attendance.id.visitId.value)
      .andWhere('attendances.date', attendance.id.date.toDateTime().toSQL())
      .andWhere('attendances.version', version - 1);

    const deleteEmployeesQuery = this.knex
      .delete()
      .from('attendances_employees')
      .where('visit_id', attendance.id.visitId.value)
      .andWhere('date', attendance.id.date.toDateTime().toSQL());

    const [result] = await Promise.all<any[]>([
      attendanceQuery,
      deleteEmployeesQuery,
    ]);

    const employeeValues = Array.from(attendance.employeeIds).map((id) => ({
      visit_id: attendance.id.visitId.value,
      date: attendance.id.date.toDateTime().toSQL(),
      employee_id: id.value,
    }));

    if (employeeValues.length > 0) {
      await this.knex.insert(employeeValues).into('attendances_employees');
    }

    return result.rowCount > 0;
  }

  async delete(attendance: Attendance): Promise<boolean> {
    const version = this.getVersion(attendance);

    const result: any = await this.knex
      .delete()
      .from('attendances')
      .where('id', attendance.id.visitId.value)
      .andWhere('date', attendance.id.date.toDateTime().toSQL())
      .andWhere('version', version);

    return result.rowCount > 0;
  }

  private map(attendanceRecord: any, employeeRecords: any[]) {
    const date = new ExactDateHydrator({
      day: attendanceRecord.date.getDate(),
      month: attendanceRecord.date.getMonth() + 1,
      year: attendanceRecord.date.getFullYear(),
    });
    const id = new AttendanceIdHydrator(attendanceRecord.visit_id, date);
    const officeId = new OfficeIdHydrator(attendanceRecord.office_id);
    const timeInterval = new TimeIntervalHydartor({
      startsAt: attendanceRecord.starts_at,
      duration: attendanceRecord.duration,
    });
    const createdAt = attendanceRecord.created_at;
    const updatedAt = attendanceRecord.updated_at;

    const employeeIds = employeeRecords.reduce<Map<string, EmployeeId>>(
      (map, record) => {
        return map.set(
          record.employee_id,
          new EmployeeIdHydrator(record.employee_id),
        );
      },
      new Map(),
    );

    return new AttendanceHydrator({
      id,
      timeInterval,
      officeId,
      employeeIds,
      createdAt,
      updatedAt,
    });
  }
}
