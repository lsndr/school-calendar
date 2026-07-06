import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, Equals, IsArray, IsIn } from 'class-validator';
import { MonthDays } from '../../../domain';

export class MonthlyRecurrenceDto {
  @ApiProperty({
    enum: ['monthly'],
  })
  @Equals('weekly')
  public type: 'monthly';

  @ApiProperty({
    type: 'array',
    items: {
      enum: [...MonthDays],
    },
  })
  @ArrayUnique()
  @IsIn(MonthDays, { each: true })
  @IsArray()
  public days: (typeof MonthDays)[number][];

  public constructor(dto: Omit<MonthlyRecurrenceDto, 'type'>) {
    this.type = 'monthly';
    this.days = dto?.days;
  }
}
