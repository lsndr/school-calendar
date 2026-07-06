import { ApiProperty } from '@nestjs/swagger';

export class CalendarTeacherDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public name: string;

  public constructor(dto: CalendarTeacherDto) {
    this.id = dto.id;
    this.name = dto.name;
  }
}
