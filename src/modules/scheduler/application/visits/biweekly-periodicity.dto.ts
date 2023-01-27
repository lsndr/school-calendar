import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, Equals, IsArray, IsIn } from 'class-validator';
import { WeekDay } from '../../domain';

const days = [0, 1, 2, 3, 4, 5, 6];

export class BiWeeklyPeriodicityDto {
  @ApiProperty({
    enum: ['biweekly'],
  })
  @Equals('biweekly')
  type: 'biweekly';

  @ApiProperty({
    type: 'array',
    items: {
      enum: days,
    },
  })
  @ArrayUnique()
  @IsIn(days, { each: true })
  @IsArray()
  week1: WeekDay[];

  @ApiProperty({
    type: 'array',
    items: {
      enum: days,
    },
  })
  @ArrayUnique()
  @IsIn(days, { each: true })
  @IsArray()
  week2: WeekDay[];

  constructor(dto: Omit<BiWeeklyPeriodicityDto, 'type'>) {
    this.type = 'biweekly';
    this.week1 = dto?.week1;
    this.week2 = dto?.week2;
  }
}
