import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsTimeZone, MaxLength, MinLength } from 'class-validator';

export class CreateSchoolDto {
  @MinLength(1)
  @MaxLength(100)
  @IsString()
  @ApiProperty()
  name: string;

  @IsTimeZone()
  @ApiProperty({
    type: 'string',
    format: 'time-zone',
  })
  timeZone: string;

  constructor(dto: CreateSchoolDto) {
    this.name = dto?.name;
    this.timeZone = dto?.timeZone;
  }
}
