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
import { ParseIsoDatePipe } from '../../shared/api';
import {
  AssignedEmployeeDto,
  AssignEmployeesDto,
  AttendanceDto,
  AttendancesService,
  CreateAttendanceDto,
  UnassignEmployeesDto,
} from '../application';

@ApiTags('Attendances')
@Controller('offices/:officeId/visits/:visitId/attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: AttendanceDto })
  @Post()
  create(
    @Param('officeId') officeId: string,
    @Param('visitId') visitId: string,
    @Body() dto: CreateAttendanceDto,
  ): Promise<AttendanceDto> {
    return this.attendancesService.create(officeId, visitId, dto);
  }

  @ApiOperation({ operationId: 'findByDate' })
  @ApiOkResponse({ type: AttendanceDto })
  @ApiNotFoundResponse()
  @Get('/:date')
  async findByDate(
    @Param('officeId') officeId: string,
    @Param('visitId') visitId: string,
    @Param('date', ParseIsoDatePipe) date: string,
  ): Promise<AttendanceDto> {
    const attendance = await this.attendancesService.findOne(
      officeId,
      visitId,
      date,
    );

    if (!attendance) {
      throw new NotFoundException();
    }

    return attendance;
  }

  @ApiOperation({ operationId: 'assignEmployees' })
  @ApiOkResponse({ type: AttendanceDto })
  @ApiNotFoundResponse()
  @Post('/:date/assign-employees')
  async assingEmployees(
    @Param('officeId') officeId: string,
    @Param('visitId') visitId: string,
    @Param('date', ParseIsoDatePipe) date: string,
    @Body() dto: AssignEmployeesDto,
  ): Promise<AssignedEmployeeDto[]> {
    return this.attendancesService.assignEmployees(
      officeId,
      visitId,
      date,
      dto,
    );
  }

  @ApiOperation({ operationId: 'unassignEmployees' })
  @ApiOkResponse({ type: AttendanceDto })
  @ApiNotFoundResponse()
  @Post('/:date/unassign-employees')
  async unassingEmployees(
    @Param('officeId') officeId: string,
    @Param('visitId') visitId: string,
    @Param('date', ParseIsoDatePipe) date: string,
    @Body() dto: UnassignEmployeesDto,
  ): Promise<AssignedEmployeeDto[]> {
    return this.attendancesService.unassignEmployees(
      officeId,
      visitId,
      date,
      dto,
    );
  }
}
