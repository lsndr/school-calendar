import { ApiProperty } from '@nestjs/swagger';
import { TimeIntervalDto } from '../visits/time-interval.dto';
import { AssignedEmployeeDto } from './assigned-employee.dto';

export class AttendanceDto {
  @ApiProperty()
  visitId: string;

  @ApiProperty({
    format: 'data',
  })
  date: string;

  @ApiProperty({
    type: [AssignedEmployeeDto],
  })
  assignedEmployees: AssignedEmployeeDto[];

  @ApiProperty({
    type: TimeIntervalDto,
  })
  time: TimeIntervalDto;

  @ApiProperty({
    format: 'date-time',
  })
  updatedAt: string;

  @ApiProperty({
    format: 'date-time',
  })
  createdAt: string;

  constructor(dto: AttendanceDto) {
    this.time = dto.time;
    this.visitId = dto.visitId;
    this.date = dto.date;
    this.assignedEmployees = dto.assignedEmployees;
    this.updatedAt = dto.updatedAt;
    this.createdAt = dto.createdAt;
  }
}
