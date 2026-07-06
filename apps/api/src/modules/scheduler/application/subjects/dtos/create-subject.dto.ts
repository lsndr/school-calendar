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
  public name: string;

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
  public recurrence:
    | DailyRecurrenceDto
    | WeeklyRecurrenceDto
    | BiWeeklyRecurrenceDto
    | MonthlyRecurrenceDto;

  @ApiProperty({
    type: TimeIntervalDto,
  })
  @ValidateNested()
  @Type(() => TimeIntervalDto)
  public time: TimeIntervalDto;

  @ApiProperty()
  @IsString()
  public groupId: string;

  @ApiProperty({
    minimum: 1,
    maximum: 3,
  })
  @Min(1)
  @Max(3)
  @IsInt()
  public requiredTeachers: number;

  public constructor(dto: CreateSubjectDto) {
    this.name = dto?.name;
    this.recurrence = dto?.recurrence;
    this.time = dto?.time;
    this.groupId = dto?.groupId;
    this.requiredTeachers = dto?.requiredTeachers;
  }
}
