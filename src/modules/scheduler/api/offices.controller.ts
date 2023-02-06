import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { CreateOfficeDto, OfficeDto, OfficesService } from '../application';

@ApiTags('Offices')
@Controller('offices')
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @ApiOperation({ operationId: 'findOffices' })
  @ApiOkResponse({ type: [OfficeDto] })
  @Get()
  async findOffices(): Promise<OfficeDto[]> {
    return this.officesService.findMany();
  }

  @ApiOperation({ operationId: 'createOffice' })
  @ApiOkResponse({ type: OfficeDto })
  @Post()
  async createOffice(@Body() dto: CreateOfficeDto): Promise<OfficeDto> {
    return this.officesService.create(dto);
  }

  @ApiOperation({ operationId: 'createOffice' })
  @ApiOkResponse({ type: OfficeDto })
  @Post()
  async createOffice(@Body() dto: CreateOfficeDto): Promise<OfficeDto> {
    return this.officesService.create(dto);
  }
}
