import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsString()
  schoolId: string;

  constructor(dto: CreateGroupDto) {
    this.name = dto?.name;
    this.schoolId = dto?.schoolId;
  }
}
