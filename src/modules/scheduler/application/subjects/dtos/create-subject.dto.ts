import { UnprocessableEntityException } from '@nestjs/common';
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
import { BiWeeklyRecurrenceDto } from './biweekly-recurrence.dto';
import { DailyRecurrenceDto } from './daily-recurrence.dto';
import { MonthlyRecurrenceDto } from './monthly-recurrence.dto';
import { WeeklyRecurrenceDto } from './weekly-recurrence.dto';
import { TimeIntervalDto } from '../../shared';

export class CreateSubjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty()
  name: string;

  @ValidateNested()
  @Transform(
    ({ value }) => {
      if (value.type === 'daily') {
        return new DailyRecurrenceDto();
      } else if (value.type === 'weekly') {
        return new WeeklyRecurrenceDto(value);
      } else if (value.type === 'biweekly') {
        return new BiWeeklyRecurrenceDto(value);
      } else if (value.type === 'monthly') {
        return new MonthlyRecurrenceDto(value);
      } else {
        throw new UnprocessableEntityException();
      }
    },
    { toClassOnly: true },
  )
  @ApiProperty({
    oneOf: [
      {
        $ref: getSchemaPath(DailyRecurrenceDto),
      },
      {
        $ref: getSchemaPath(WeeklyRecurrenceDto),
      },
      {
        $ref: getSchemaPath(BiWeeklyRecurrenceDto),
      },
      {
        $ref: getSchemaPath(MonthlyRecurrenceDto),
      },
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
  @ValidateNested()
  @Type(() => TimeIntervalDto)
  time: TimeIntervalDto;

  @ApiProperty()
  @IsString()
  groupId: string;

  @ApiProperty({
    minimum: 1,
    maximum: 3,
  })
  @Min(1)
  @Max(3)
  @IsInt()
  requiredTeachers: number;

  constructor(dto: CreateSubjectDto) {
    this.name = dto?.name;
    this.recurrence = dto?.recurrence;
    this.time = dto?.time;
    this.groupId = dto?.groupId;
    this.requiredTeachers = dto?.requiredTeachers;
  }
}
