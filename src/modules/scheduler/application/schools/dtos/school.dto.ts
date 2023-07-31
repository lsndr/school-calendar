import { ApiProperty } from '@nestjs/swagger';

export class SchoolDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    type: 'string',
    format: 'time-zone',
  })
  timeZone: string;

  constructor(dto: SchoolDto) {
    this.id = dto.id;
    this.name = dto.name;
    this.timeZone = dto.timeZone;
  }
}
