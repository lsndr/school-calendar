import { ApiProperty } from '@nestjs/swagger';
import { TimeIntervalDto } from '../subjects/time-interval.dto';

export class LessonDto {
  @ApiProperty()
  subjectId: string;

  @ApiProperty({
    format: 'data',
  })
  date: string;

  @ApiProperty({
    type: [String],
  })
  teacherIds: string[];

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
    this.teacherIds = dto.teacherIds;
    this.updatedAt = dto.updatedAt;
    this.createdAt = dto.createdAt;
  }
}
