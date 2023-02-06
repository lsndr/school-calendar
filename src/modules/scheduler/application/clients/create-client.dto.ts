import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty()
  name: string;

  constructor(dto: CreateClientDto) {
    this.name = dto?.name;
  }
}
