import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { BiWeeklyRecurrenceDto } from './biweekly-recurrence.dto';
import { DailyRecurrenceDto } from './daily-recurrence.dto';
import { MonthlyRecurrenceDto } from './monthly-recurrence.dto';
import { TimeIntervalDto } from './time-interval.dto';
import { WeeklyRecurrenceDto } from './weekly-recurrence.dto';

export class SubjectDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(DailyRecurrenceDto) },
      { $ref: getSchemaPath(WeeklyRecurrenceDto) },
      { $ref: getSchemaPath(BiWeeklyRecurrenceDto) },
      { $ref: getSchemaPath(MonthlyRecurrenceDto) },
    ],
  })
  recurrence:
    | DailyRecurrenceDto
    | WeeklyRecurrenceDto
    | BiWeeklyRecurrenceDto
    | MonthlyRecurrenceDto;

  @ApiProperty({
    type: TimeIntervalDto,
  })
  time: TimeIntervalDto;

  @ApiProperty()
  groupId: string;

  @ApiProperty()
  requiredTeachers: number;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: string;

  constructor(dto: SubjectDto) {
    this.id = dto?.id;
    this.name = dto?.name;
    this.recurrence = dto?.recurrence;
    this.time = dto?.time;
    this.groupId = dto?.groupId;
    this.requiredTeachers = dto?.requiredTeachers;
    this.createdAt = dto?.createdAt;
    this.updatedAt = dto?.updatedAt;
  }
}
