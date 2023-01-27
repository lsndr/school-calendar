import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TimeIntervalDto } from '../visits/time-interval.dto';

export class CreateAttendanceDto {
  @IsDateString()
  @ApiProperty({
    format: 'date',
  })
  date: string;

  @ArrayUnique()
  @IsString({ each: true })
  @IsArray()
  @ApiProperty({
    type: [String],
  })
  employeeIds: string[];

  @ApiProperty({
    type: TimeIntervalDto,
  })
  @ValidateNested()
  @Type(() => TimeIntervalDto)
  timeInterval: TimeIntervalDto;

  constructor(dto: CreateAttendanceDto) {
    this.date = dto?.date;
    this.employeeIds = dto?.employeeIds;
    this.timeInterval = dto?.timeInterval;
  }
}
