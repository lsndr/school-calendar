import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class AssignEmployeesDto {
  @ArrayUnique()
  @IsString({ each: true })
  @IsArray()
  @ApiProperty({
    type: [String],
  })
  employeeIds: string[];

  constructor(dto: AssignEmployeesDto) {
    this.employeeIds = dto?.employeeIds;
  }
}
