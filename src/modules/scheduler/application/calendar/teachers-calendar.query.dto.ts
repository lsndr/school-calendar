import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Max } from 'class-validator';

export class TeachersCalendarQueryDto {
  @ApiProperty()
  @IsDateString()
  dateFrom: string;

  @ApiProperty()
  @Max(7)
  @IsInt()
  days: number;

  constructor(dto: TeachersCalendarQueryDto) {
    this.dateFrom = dto?.dateFrom;
    this.days = dto?.days;
  }
}
