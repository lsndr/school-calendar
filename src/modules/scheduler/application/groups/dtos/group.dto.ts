import { ApiProperty } from '@nestjs/swagger';

export class GroupDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  constructor(dto: GroupDto) {
    this.id = dto.id;
    this.name = dto.name;
  }
}
