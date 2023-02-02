import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Max, Min } from 'class-validator';

export class TeachersCalendarQueryDto {
  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @Max(7)
  @Min(1)
  @IsInt()
  days: number;

  constructor(dto: TeachersCalendarQueryDto) {
    this.startDate = dto?.startDate;
    this.days = dto?.days;
  }
}
