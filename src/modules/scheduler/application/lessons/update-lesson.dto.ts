import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TimeIntervalDto } from '../subjects/time-interval.dto';

export class UpdateLessonDto {
  @ArrayUnique()
  @IsString({ each: true })
  @IsArray()
  @ApiProperty({
    type: [String],
  })
  teacherIds: string[];

  @ApiProperty({
    required: false,
    type: TimeIntervalDto,
  })
  @ValidateNested()
  @Type(() => TimeIntervalDto)
  time?: TimeIntervalDto;

  constructor(dto: UpdateLessonDto) {
    this.teacherIds = dto?.teacherIds;
    this.time = dto?.time;
  }
}
