import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class AssignTeachersDto {
  @ArrayUnique()
  @IsString({ each: true })
  @IsArray()
  @ApiProperty({
    type: [String],
  })
  public teacherIds: string[];

  public constructor(dto: AssignTeachersDto) {
    this.teacherIds = dto?.teacherIds;
  }
}
