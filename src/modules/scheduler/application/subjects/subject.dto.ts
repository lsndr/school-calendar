import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { BiWeeklyPeriodicityDto } from './biweekly-periodicity.dto';
import { DailyPeriodicityDto } from './daily-periodicity.dto';
import { MonthlyPeriodicityDto } from './monthly-periodicity.dto';
import { TimeIntervalDto } from './time-interval.dto';
import { WeeklyPeriodicityDto } from './weekly-periodicity.dto';

export class SubjectDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(DailyPeriodicityDto) },
      { $ref: getSchemaPath(WeeklyPeriodicityDto) },
      { $ref: getSchemaPath(BiWeeklyPeriodicityDto) },
      { $ref: getSchemaPath(MonthlyPeriodicityDto) },
    ],
  })
  periodicity:
    | DailyPeriodicityDto
    | WeeklyPeriodicityDto
    | BiWeeklyPeriodicityDto
    | MonthlyPeriodicityDto;

  @ApiProperty({
    type: TimeIntervalDto,
  })
  timeInterval: TimeIntervalDto;

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
    this.periodicity = dto?.periodicity;
    this.timeInterval = dto?.timeInterval;
    this.groupId = dto?.groupId;
    this.requiredTeachers = dto?.requiredTeachers;
    this.createdAt = dto?.createdAt;
    this.updatedAt = dto?.updatedAt;
  }
}
