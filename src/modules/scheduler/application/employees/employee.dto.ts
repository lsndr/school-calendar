import { ApiProperty } from '@nestjs/swagger';

export class EmployeeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  constructor(dto: EmployeeDto) {
    this.id = dto.id;
    this.name = dto.name;
  }
}
