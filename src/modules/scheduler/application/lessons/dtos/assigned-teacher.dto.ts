import { ApiProperty } from '@nestjs/swagger';

export class AssignedTeacherDto {
  @ApiProperty()
  teacherId: string;

  @ApiProperty({
    format: 'date-time',
  })
  assignedAt: string;

  constructor(dto: AssignedTeacherDto) {
    this.teacherId = dto.teacherId;
    this.assignedAt = dto.assignedAt;
  }
}
