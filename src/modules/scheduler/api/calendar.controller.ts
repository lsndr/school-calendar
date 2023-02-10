import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import {
  TeachersCalendarDto,
  TeachersCalendarQueryDto,
  TeachersCalendarService,
} from '../application/calendar';

@ApiTags('Calendar')
@Controller('schools/:schoolId/calendar')
export class CalendarController {
  constructor(
    private readonly teachersCalendarService: TeachersCalendarService,
  ) {}

  @ApiOperation({ operationId: 'getTeachersCalendar' })
  @ApiOkResponse({ type: TeachersCalendarDto })
  @Get('/teachers')
  findMany(
    @Param('schoolId') schoolId: string,
    @Query() query: TeachersCalendarQueryDto,
  ): Promise<TeachersCalendarDto> {
    return this.teachersCalendarService.getForPeriod(schoolId, query);
  }
}
