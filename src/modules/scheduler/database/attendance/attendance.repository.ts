import { Repository } from 'yuow';
import { Attendance } from '../../domain';
import { AttendanceDataMapper } from './attendance.datamapper';

export class AttendanceRepository extends Repository<
  Attendance,
  AttendanceDataMapper
> {
  protected mapperConstructor = AttendanceDataMapper;

  protected extractIdentity(attendance: Attendance) {
    return attendance.id;
  }

  async findOne(...args: Parameters<AttendanceDataMapper['findOne']>) {
    const result = await this.mapper.findOne(...args);

    return this.trackAll(result, 'loaded');
  }
}
