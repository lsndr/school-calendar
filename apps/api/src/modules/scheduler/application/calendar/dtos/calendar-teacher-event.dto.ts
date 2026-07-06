import { ApiProperty } from '@nestjs/swagger';

export class CalendarTeacherEventDto {
  @ApiProperty()
  public subjectId: string;

  @ApiProperty({
    required: false,
  })
  public teacherId?: string;

  @ApiProperty()
  public name: string;

  @ApiProperty({
    format: 'date-time',
  })
  public startsAt: string;

  @ApiProperty()
  public duration: number;

  @ApiProperty()
  public assignedTeachers: number;

  @ApiProperty()
  public requiredTeachers: number;

  public constructor(dto: CalendarTeacherEventDto) {
    this.subjectId = dto.subjectId;
    this.teacherId = dto.teacherId;
    this.name = dto.name;
    this.startsAt = dto.startsAt;
    this.duration = dto.duration;
    this.assignedTeachers = dto.assignedTeachers;
    this.requiredTeachers = dto.requiredTeachers;
  }
}
