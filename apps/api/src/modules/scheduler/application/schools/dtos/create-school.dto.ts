import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsTimeZone, MinLength } from 'class-validator';

export class CreateSchoolDto {
  @MinLength(1)
  @MaxLength(100)
  @IsString()
  @ApiProperty()
  public name: string;

  @IsTimeZone()
  @ApiProperty({
    type: 'string',
    format: 'time-zone',
  })
  public timeZone: string;

  public constructor(dto: CreateSchoolDto) {
    this.name = dto?.name;
    this.timeZone = dto?.timeZone;
  }
}
