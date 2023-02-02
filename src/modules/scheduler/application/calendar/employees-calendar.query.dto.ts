import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class EmployeesCalendarQueryDto {
  @ApiProperty()
  @IsDateString()
  dateFrom: string;

  @ApiProperty()
  @IsDateString()
  dateTo: string;

  constructor(dto: EmployeesCalendarQueryDto) {
    this.dateFrom = dto?.dateFrom;
    this.dateTo = dto?.dateTo;
  }
}
