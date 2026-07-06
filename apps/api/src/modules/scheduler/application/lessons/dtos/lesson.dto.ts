import { ApiProperty } from '@nestjs/swagger';
import { AssignedTeacherDto } from './assigned-teacher.dto';
import { TimeIntervalDto } from '../../shared';

export class LessonDto {
  @ApiProperty()
  public subjectId: string;

  @ApiProperty({
    format: 'data',
  })
  public date: string;

  @ApiProperty({
    type: [AssignedTeacherDto],
  })
  public assignedTeachers: AssignedTeacherDto[];

  @ApiProperty({
    type: TimeIntervalDto,
  })
  public time: TimeIntervalDto;

  @ApiProperty({
    format: 'date-time',
  })
  public updatedAt: string;

  @ApiProperty({
    format: 'date-time',
  })
  public createdAt: string;

  public constructor(dto: LessonDto) {
    this.time = dto.time;
    this.subjectId = dto.subjectId;
    this.date = dto.date;
    this.assignedTeachers = dto.assignedTeachers;
    this.updatedAt = dto.updatedAt;
    this.createdAt = dto.createdAt;
  }
}
