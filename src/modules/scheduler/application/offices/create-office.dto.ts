import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsTimeZone, MinLength } from 'class-validator';

export class CreateOfficeDto {
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

  constructor(dto: CreateOfficeDto) {
    this.name = dto?.name;
    this.timeZone = dto?.timeZone;
  }
}
