import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TimeIntervalDto } from '../visits/time-interval.dto';

export class UpdateAttendanceDto {
  @ArrayUnique()
  @IsString({ each: true })
  @IsArray()
  @ApiProperty({
    type: [String],
  })
  employeeIds: string[];

  @ApiProperty({
    required: false,
    type: TimeIntervalDto,
  })
  @ValidateNested()
  @Type(() => TimeIntervalDto)
  time?: TimeIntervalDto;

  constructor(dto: UpdateAttendanceDto) {
    this.employeeIds = dto?.employeeIds;
    this.time = dto?.time;
  }
}
