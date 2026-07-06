import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TimeIntervalDto } from '../../shared';

export class UpdateLessonDto {
  @ArrayUnique()
  @IsString({ each: true })
  @IsArray()
  @ApiProperty({
    type: [String],
  })
  public teacherIds: string[];

  @ApiProperty({
    required: false,
    type: TimeIntervalDto,
  })
  @ValidateNested()
  @Type(() => TimeIntervalDto)
  public time?: TimeIntervalDto;

  public constructor(dto: UpdateLessonDto) {
    this.teacherIds = dto?.teacherIds;
    this.time = dto?.time;
  }
}
