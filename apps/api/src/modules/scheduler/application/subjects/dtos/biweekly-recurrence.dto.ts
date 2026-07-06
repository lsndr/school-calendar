import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, Equals, IsArray, IsIn } from 'class-validator';
import { WeekDays } from '../../../domain';

export class BiWeeklyRecurrenceDto {
  @ApiProperty({
    enum: ['biweekly'],
  })
  @Equals('biweekly')
  public type: 'biweekly';

  @ApiProperty({
    type: 'array',
    items: {
      enum: [...WeekDays],
    },
  })
  @ArrayUnique()
  @IsIn(WeekDays, { each: true })
  @IsArray()
  public readonly week1: (typeof WeekDays)[number][];

  @ApiProperty({
    type: 'array',
    items: {
      enum: [...WeekDays],
    },
  })
  @ArrayUnique()
  @IsIn(WeekDays, { each: true })
  @IsArray()
  public readonly week2: (typeof WeekDays)[number][];

  public constructor(dto: Omit<BiWeeklyRecurrenceDto, 'type'>) {
    this.type = 'biweekly';
    this.week1 = dto?.week1;
    this.week2 = dto?.week2;
  }
}
