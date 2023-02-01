import { ApiProperty } from '@nestjs/swagger';

export class AssignedEmployeeDto {
  @ApiProperty()
  employeeId: string;

  @ApiProperty({
    format: 'date-time',
  })
  assignedAt: string;

  constructor(dto: AssignedEmployeeDto) {
    this.employeeId = dto.employeeId;
    this.assignedAt = dto.assignedAt;
  }
}
