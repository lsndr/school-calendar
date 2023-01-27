import { ApiProperty } from '@nestjs/swagger';

export class ClientDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  constructor(dto: ClientDto) {
    this.id = dto.id;
    this.name = dto.name;
  }
}
