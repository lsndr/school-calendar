import { ApiProperty } from '@nestjs/swagger';

export class TeacherDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  constructor(dto: TeacherDto) {
    this.id = dto.id;
    this.name = dto.name;
  }
}
