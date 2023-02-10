import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import {
  EmployeesCalendarDto,
  EmployeesCalendarQueryDto,
  EmployeesCalendarService,
} from '../application/calendar';

@ApiTags('Calendar')
@Controller('offices/:officeId/calendar')
export class CalendarController {
  constructor(
    private readonly employeesCalendarService: EmployeesCalendarService,
  ) {}

  @ApiOperation({ operationId: 'getEmployeesCalendar' })
  @ApiOkResponse({ type: EmployeesCalendarDto })
  @Get('/employees')
  findMany(
    @Param('officeId') officeId: string,
    @Query() query: EmployeesCalendarQueryDto,
  ): Promise<EmployeesCalendarDto> {
    return this.employeesCalendarService.getForPeriod(officeId, query);
  }
}
