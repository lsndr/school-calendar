import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TimeIntervalDto } from '../../shared';

export class CreateLessonDto {
  @IsDateString()
  @ApiProperty({
    format: 'date',
  })
  public date: string;

  @ArrayUnique()
  @IsString({ each: true })
  @IsArray()
  @ApiProperty({
    type: [String],
  })
  public teacherIds: string[];

  @ApiProperty({
    type: TimeIntervalDto,
  })
  @ValidateNested()
  @Type(() => TimeIntervalDto)
  public time: TimeIntervalDto;

  public constructor(dto: CreateLessonDto) {
    this.date = dto?.date;
    this.teacherIds = dto?.teacherIds;
    this.time = dto?.time;
  }
}
