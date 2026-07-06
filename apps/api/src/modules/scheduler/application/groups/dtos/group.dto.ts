import { ApiProperty } from '@nestjs/swagger';

export class GroupDto {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public name: string;

  public constructor(dto: GroupDto) {
    this.id = dto.id;
    this.name = dto.name;
  }
}
