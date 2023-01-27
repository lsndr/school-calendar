import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class UnassignTeachersDto {
  @ArrayUnique()
  @IsString({ each: true })
  @IsArray()
  @ApiProperty({
    type: [String],
  })
  teacherIds: string[];

  constructor(dto: UnassignTeachersDto) {
    this.teacherIds = dto?.teacherIds;
  }
}
