import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
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

  @ApiOperation({ operationId: 'findById' })
  @ApiOkResponse({ type: EmployeeDto })
  @ApiNotFoundResponse()
  @Get('/:id')
  async findById(
    @Param('officeId') officeId: string,
    @Param('id') id: string,
  ): Promise<EmployeeDto> {
    const employee = await this.employeesService.findOne(officeId, id);

    if (!employee) {
      throw new NotFoundException();
    }

    return employee;
  }
}
