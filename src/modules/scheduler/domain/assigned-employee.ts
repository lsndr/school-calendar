import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { EmployeeIdType } from '../database';
import { AssignedEmployeeId } from './assigned-employee-id';
import { Attendance } from './attendance';
import { EmployeeId } from './employee-id';

@Entity({ tableName: 'attendance_employee', customRepository: () => Object })
export class AssignedEmployee {
  @PrimaryKey({ type: EmployeeIdType })
  id: AssignedEmployeeId;

  @Property({ type: EmployeeIdType })
  employeeId: EmployeeId;

  @Property()
  assignedAt: DateTime;

  @ManyToOne(() => Attendance)
  attendance!: Rel<Attendance>;

  constructor(state: Omit<AssignedEmployee, 'attendance'>) {
    this.id = state.id;
    this.employeeId = state.employeeId;
    this.assignedAt = state.assignedAt;
  }
}
