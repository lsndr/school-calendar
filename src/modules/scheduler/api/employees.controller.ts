import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import {
  EmployeesService,
  EmployeeDto,
  CreateEmployeeDto,
} from '../application';

@ApiTags('Employees')
@Controller('offices/:officeId/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: EmployeeDto })
  @Post()
  create(
    @Param('officeId') officeId: string,
    @Body() dto: CreateEmployeeDto,
  ): Promise<EmployeeDto> {
    return this.employeesService.create(officeId, dto);
  }

  @ApiOperation({ operationId: 'findMany' })
  @ApiOkResponse({ type: [EmployeeDto] })
  @Get()
  findMany(@Param('officeId') officeId: string): Promise<EmployeeDto[]> {
    return this.employeesService.findMany(officeId);
  }
}
