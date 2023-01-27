import { ApiProperty } from '@nestjs/swagger';

export class CalendarEmployeeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  constructor(dto: CalendarEmployeeDto) {
    this.id = dto.id;
    this.name = dto.name;
  }
}
