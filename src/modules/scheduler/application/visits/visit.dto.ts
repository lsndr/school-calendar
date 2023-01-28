import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { BiWeeklyPeriodicityDto } from './biweekly-periodicity.dto';
import { DailyPeriodicityDto } from './daily-periodicity.dto';
import { MonthlyPeriodicityDto } from './monthly-periodicity.dto';
import { TimeIntervalDto } from './time-interval.dto';
import { WeeklyPeriodicityDto } from './weekly-periodicity.dto';

export class VisitDto {
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
  time: TimeIntervalDto;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  requiredEmployees: number;

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

  constructor(dto: VisitDto) {
    this.id = dto?.id;
    this.name = dto?.name;
    this.periodicity = dto?.periodicity;
    this.time = dto?.time;
    this.clientId = dto?.clientId;
    this.requiredEmployees = dto?.requiredEmployees;
    this.createdAt = dto?.createdAt;
    this.updatedAt = dto?.updatedAt;
  }
}
