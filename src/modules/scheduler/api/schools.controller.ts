import { Body, Post, Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { CreateSchoolDto, SchoolDto, SchoolsService } from '../application';

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

  @ApiOperation({ operationId: 'createSchool' })
  @ApiOkResponse({ type: SchoolDto })
  @Post()
  async createSchool(@Body() dto: CreateSchoolDto): Promise<SchoolDto> {
    return this.schoolsService.create(dto);
  }
}
