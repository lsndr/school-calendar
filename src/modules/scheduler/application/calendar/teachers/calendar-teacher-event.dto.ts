import { ApiProperty } from '@nestjs/swagger';

export class CalendarTeacherEventDto {
  @ApiProperty()
  subjectId: string;

  @ApiProperty({
    required: false,
  })
  teacherId?: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    format: 'date-time',
  })
  startsAt: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  assignedTeachers: number;

  @ApiProperty()
  requiredTeachers: number;

  constructor(dto: CalendarTeacherEventDto) {
    this.subjectId = dto.subjectId;
    this.teacherId = dto.teacherId;
    this.name = dto.name;
    this.startsAt = dto.startsAt;
    this.duration = dto.duration;
    this.assignedTeachers = dto.assignedTeachers;
    this.requiredTeachers = dto.requiredTeachers;
  }
}
