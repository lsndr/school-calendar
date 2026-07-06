import { ApiProperty } from '@nestjs/swagger';

export class AssignedTeacherDto {
  @ApiProperty()
  public teacherId: string;

  @ApiProperty({
    format: 'date-time',
  })
  public assignedAt: string;

  public constructor(dto: AssignedTeacherDto) {
    this.teacherId = dto.teacherId;
    this.assignedAt = dto.assignedAt;
  }
}
