import { ApiProperty } from '@nestjs/swagger';

export class CalendarEmployeeEventDto {
  @ApiProperty()
  visitId: string;

  @ApiProperty({
    required: false,
  })
  employeeId?: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    format: 'date-time',
  })
  startsAt: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  assignedEmployees: number;

  @ApiProperty()
  requiredEmployees: number;

  constructor(dto: CalendarEmployeeEventDto) {
    this.visitId = dto.visitId;
    this.employeeId = dto.employeeId;
    this.name = dto.name;
    this.startsAt = dto.startsAt;
    this.duration = dto.duration;
    this.assignedEmployees = dto.assignedEmployees;
    this.requiredEmployees = dto.requiredEmployees;
  }
}
