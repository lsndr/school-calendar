import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { BiWeeklyPeriodicity } from '../../domain';
import { BiWeeklyPeriodicityDto } from './biweekly-periodicity.dto';
import { DailyPeriodicityDto } from './daily-periodicity.dto';
import { MonthlyPeriodicityDto } from './monthly-periodicity.dto';
import { TimeIntervalDto } from './time-interval.dto';
import { WeeklyPeriodicityDto } from './weekly-periodicity.dto';

export class CreateVisitDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty()
  name: string;

  @ValidateNested()
  @Transform(
    ({ value }) => {
      if (!('type' in value)) {
        return;
      }

      if (value.type === 'daily') {
        return new DailyPeriodicityDto();
      } else if (value.type === 'weekly') {
        return new WeeklyPeriodicityDto(value);
      } else if (value.type === 'biweekly') {
        return new BiWeeklyPeriodicityDto(value);
      } else if (value.type === 'monthly') {
        return new MonthlyPeriodicityDto(value);
      }
    },
    { toClassOnly: true },
  )
  @ApiProperty({
    oneOf: [
      {
        $ref: getSchemaPath(DailyPeriodicityDto),
      },
      {
        $ref: getSchemaPath(WeeklyPeriodicityDto),
      },
      {
        $ref: getSchemaPath(BiWeeklyPeriodicity),
      },
      {
        $ref: getSchemaPath(MonthlyPeriodicityDto),
      },
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
  @Type(() => TimeIntervalDto)
  timeInterval: TimeIntervalDto;

  @ApiProperty()
  @IsString()
  clientId: string;

  @ApiProperty()
  @Min(1)
  @Max(3)
  @IsInt()
  requiredEmployees: number;

  constructor(dto: CreateVisitDto) {
    this.name = dto?.name;
    this.periodicity = dto?.periodicity;
    this.timeInterval = dto?.timeInterval;
    this.clientId = dto?.clientId;
    this.requiredEmployees = dto?.requiredEmployees;
  }
}
