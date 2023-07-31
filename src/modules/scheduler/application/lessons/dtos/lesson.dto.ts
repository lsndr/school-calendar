import { ApiProperty } from '@nestjs/swagger';
import { AssignedTeacherDto } from './assigned-teacher.dto';
import { TimeIntervalDto } from '../../shared';

export class LessonDto {
  @ApiProperty()
  subjectId: string;

  @ApiProperty({
    format: 'data',
  })
  date: string;

  @ApiProperty({
    type: [AssignedTeacherDto],
  })
  assignedTeachers: AssignedTeacherDto[];

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

  constructor(dto: LessonDto) {
    this.time = dto.time;
    this.subjectId = dto.subjectId;
    this.date = dto.date;
    this.assignedTeachers = dto.assignedTeachers;
    this.updatedAt = dto.updatedAt;
    this.createdAt = dto.createdAt;
  }
}
