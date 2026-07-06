import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty()
  public name: string;

  public constructor(dto: CreateTeacherDto) {
    this.name = dto?.name;
  }
}
