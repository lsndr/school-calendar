import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, Max, Min } from 'class-validator';

export class TeachersCalendarFiltersDto {
  @ApiProperty()
  @IsDateString()
  public startDate: string;

  @ApiProperty()
  @Max(7)
  @Min(1)
  @IsInt()
  @Type(() => Number)
  public days: number;

  public constructor(dto: TeachersCalendarFiltersDto) {
    this.startDate = dto?.startDate;
    this.days = dto?.days;
  }
}
