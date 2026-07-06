import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, Equals, IsArray, IsIn } from 'class-validator';
import { WeekDays } from '../../../domain';

export class WeeklyRecurrenceDto {
  @ApiProperty({
    enum: ['weekly'],
  })
  @Equals('weekly')
  public type: 'weekly';

  @ApiProperty({
    type: 'array',
    items: {
      enum: [...WeekDays],
    },
  })
  @ArrayUnique()
  @IsIn(WeekDays, { each: true })
  @IsArray()
  public days: (typeof WeekDays)[number][];

  public constructor(dto: Omit<WeeklyRecurrenceDto, 'type'>) {
    this.type = 'weekly';
    this.days = dto?.days;
  }
}
