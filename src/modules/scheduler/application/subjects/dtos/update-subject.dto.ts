import { UnprocessableEntityException } from '@nestjs/common';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
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

export class UpdateSubjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  @ApiProperty({ required: false })
  name?: string;

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
    required: false,
  })
  @IsOptional()
  recurrence?:
    | DailyRecurrenceDto
    | WeeklyRecurrenceDto
    | BiWeeklyRecurrenceDto
    | MonthlyRecurrenceDto;

  @ApiProperty({
    type: TimeIntervalDto,
    required: false,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => TimeIntervalDto)
  time?: TimeIntervalDto;

  @ApiProperty({
    minimum: 1,
    maximum: 3,
    required: false,
  })
  @Min(1)
  @Max(3)
  @IsInt()
  @IsOptional()
  requiredTeachers?: number;

  constructor(dto: UpdateSubjectDto) {
    this.name = dto?.name;
    this.recurrence = dto?.recurrence;
    this.time = dto?.time;
    this.requiredTeachers = dto?.requiredTeachers;
  }
}
