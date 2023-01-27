import { ApiProperty } from '@nestjs/swagger';
import { TimeIntervalDto } from '../visits/time-interval.dto';

export class AttendanceDto {
  @ApiProperty()
  visitId: string;

  @ApiProperty({
    format: 'data',
  })
  date: string;

  @ApiProperty({
    type: [String],
  })
  employeeIds: string[];

  @ApiProperty({
    type: TimeIntervalDto,
  })
  timeInterval: TimeIntervalDto;

  @ApiProperty({
    format: 'date-time',
  })
  updatedAt: string;

  @ApiProperty({
    format: 'date-time',
  })
  createdAt: string;

  constructor(dto: AttendanceDto) {
    this.timeInterval = dto.timeInterval;
    this.visitId = dto.visitId;
    this.date = dto.date;
    this.employeeIds = dto.employeeIds;
    this.updatedAt = dto.updatedAt;
    this.createdAt = dto.createdAt;
  }
}
