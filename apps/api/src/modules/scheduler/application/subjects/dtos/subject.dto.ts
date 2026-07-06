import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { BiWeeklyRecurrenceDto } from './biweekly-recurrence.dto';
import { DailyRecurrenceDto } from './daily-recurrence.dto';
import { MonthlyRecurrenceDto } from './monthly-recurrence.dto';
import { WeeklyRecurrenceDto } from './weekly-recurrence.dto';
import { TimeIntervalDto } from '../../shared';

@ApiExtraModels(
  DailyRecurrenceDto,
  WeeklyRecurrenceDto,
  BiWeeklyRecurrenceDto,
  MonthlyRecurrenceDto,
)
export class SubjectDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public name: string;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(DailyRecurrenceDto) },
      { $ref: getSchemaPath(WeeklyRecurrenceDto) },
      { $ref: getSchemaPath(BiWeeklyRecurrenceDto) },
      { $ref: getSchemaPath(MonthlyRecurrenceDto) },
    ],
  })
  public recurrence:
    | DailyRecurrenceDto
    | WeeklyRecurrenceDto
    | BiWeeklyRecurrenceDto
    | MonthlyRecurrenceDto;

  @ApiProperty({
    type: TimeIntervalDto,
  })
  public time: TimeIntervalDto;

  @ApiProperty()
  public groupId: string;

  @ApiProperty()
  public requiredTeachers: number;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  public createdAt: string;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  public updatedAt: string;

  public constructor(dto: SubjectDto) {
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
