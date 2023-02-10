import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, Max, Min } from 'class-validator';

export class EmployeesCalendarQueryDto {
  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @Max(7)
  @Min(1)
  @IsInt()
  @Type(() => Number)
  days: number;

  constructor(dto: EmployeesCalendarQueryDto) {
    this.startDate = dto?.startDate;
    this.days = dto?.days;
  }
}
