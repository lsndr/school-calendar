import { ApiProperty } from '@nestjs/swagger';

export class SchoolDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public name: string;

  @ApiProperty({
    type: 'string',
    format: 'time-zone',
  })
  public timeZone: string;

  public constructor(dto: SchoolDto) {
    this.id = dto.id;
    this.name = dto.name;
    this.timeZone = dto.timeZone;
  }
}
