import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { SchoolDto, SchoolsService } from '../application';

@ApiTags('Schools')
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @ApiOperation({ operationId: 'findSchools' })
  @ApiOkResponse({ type: [SchoolDto] })
  @Get()
  async findSchools(): Promise<SchoolDto[]> {
    return this.schoolsService.findMany();
  }
}
