import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, Equals, IsArray, IsIn } from 'class-validator';
import { MonthDay } from '../../domain';

const days = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24, 25, 26, 27, 28, 29, 30,
];

export class MonthlyPeriodicityDto {
  @ApiProperty({
    enum: ['monthly'],
  })
  @Equals('weekly')
  type: 'monthly';

  @ApiProperty({
    type: 'array',
    items: {
      enum: days,
    },
  })
  @ArrayUnique()
  @IsIn(days, { each: true })
  @IsArray()
  days: MonthDay[];

  constructor(dto: Omit<MonthlyPeriodicityDto, 'type'>) {
    this.type = 'monthly';
    this.days = dto?.days;
  }
}
