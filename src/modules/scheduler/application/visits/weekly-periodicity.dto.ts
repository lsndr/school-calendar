import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, Equals, IsArray, IsIn } from 'class-validator';
import { WeekDay } from '../../domain';

const days = [0, 1, 2, 3, 4, 5, 6];

export class WeeklyPeriodicityDto {
  @ApiProperty({
    enum: ['weekly'],
  })
  @Equals('weekly')
  type: 'weekly';

  @ApiProperty({
    type: 'array',
    items: {
      enum: days,
    },
  })
  @ArrayUnique()
  @IsIn(days, { each: true })
  @IsArray()
  days: WeekDay[];

  constructor(dto: Omit<WeeklyPeriodicityDto, 'type'>) {
    this.type = 'weekly';
    this.days = dto?.days;
  }
}
