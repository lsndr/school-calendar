import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import {
  TeachersCalendarDto,
  TeachersCalendarFiltersDto,
  GetTeachersCalendarQuery,
} from '../application/calendar';
import { QueryBus } from '@shared/cqrs';

@ApiTags('Calendar')
@Controller('schools/:schoolId/calendar')
export class CalendarController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ operationId: 'getTeachersCalendar' })
  @ApiOkResponse({ type: TeachersCalendarDto })
  @Get('/teachers')
  findMany(
    @Param('schoolId') schoolId: string,
    @Query() filters: TeachersCalendarFiltersDto,
  ): Promise<TeachersCalendarDto> {
    return this.queryBus.execute(
      new GetTeachersCalendarQuery({ schoolId, filters }),
    );
  }
}
