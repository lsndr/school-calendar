import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import {
  AttendanceDto,
  AttendancesService,
  CreateAttendanceDto,
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
}
