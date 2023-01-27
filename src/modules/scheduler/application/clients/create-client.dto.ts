import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsString()
  officeId: string;

  constructor(dto: CreateClientDto) {
    this.name = dto?.name;
    this.officeId = dto?.officeId;
  }
}
