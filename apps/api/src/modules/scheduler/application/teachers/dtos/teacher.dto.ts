import { ApiProperty } from '@nestjs/swagger';

export class TeacherDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public name: string;

  public constructor(dto: TeacherDto) {
    this.id = dto.id;
    this.name = dto.name;
  }
}
