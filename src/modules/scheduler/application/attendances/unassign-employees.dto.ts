import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class UnassignEmployeesDto {
  @ArrayUnique()
  @IsString({ each: true })
  @IsArray()
  @ApiProperty({
    type: [String],
  })
  employeeIds: string[];

  constructor(dto: UnassignEmployeesDto) {
    this.employeeIds = dto?.employeeIds;
  }
}
