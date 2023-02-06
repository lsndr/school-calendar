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
import { CreateSchoolDto, SchoolDto, SchoolsService } from '../application';

@ApiTags('Schools')
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @ApiOperation({ operationId: 'findMany' })
  @ApiOkResponse({ type: [SchoolDto] })
  @Get()
  async findMany(): Promise<SchoolDto[]> {
    return await this.schoolsService.findMany();
  }

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: SchoolDto })
  @Post()
  async create(@Body() dto: CreateSchoolDto): Promise<SchoolDto> {
    return await this.schoolsService.create(dto);
  }

  @ApiOperation({ operationId: 'findById' })
  @ApiOkResponse({ type: SchoolDto })
  @ApiNotFoundResponse()
  @Get('/:id')
  async findById(@Param('id') id: string): Promise<SchoolDto> {
    const school = await this.schoolsService.findOne(id);

    if (!school) {
      throw new NotFoundException();
    }

    return school;
  }
}
