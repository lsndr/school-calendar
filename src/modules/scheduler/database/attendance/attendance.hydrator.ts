import { Attendance, AttendanceState } from '../../domain';

export class AttendanceHydrator extends Attendance {
  constructor(state: AttendanceState) {
    super(state);
  }
}
