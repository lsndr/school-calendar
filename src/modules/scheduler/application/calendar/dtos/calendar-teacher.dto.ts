import { ApiProperty } from '@nestjs/swagger';

export class CalendarTeacherDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  constructor(dto: CalendarTeacherDto) {
    this.id = dto.id;
    this.name = dto.name;
  }
}
