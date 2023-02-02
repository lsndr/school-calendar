import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class TeachersCalendarQueryDto {
  @ApiProperty()
  @IsDateString()
  dateFrom: string;

  @ApiProperty()
  @IsDateString()
  dateTo: string;

  constructor(dto: TeachersCalendarQueryDto) {
    this.dateFrom = dto?.dateFrom;
    this.dateTo = dto?.dateTo;
  }
}
