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
import { CreateOfficeDto, OfficeDto, OfficesService } from '../application';

@ApiTags('Offices')
@Controller('offices')
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @ApiOperation({ operationId: 'findMany' })
  @ApiOkResponse({ type: [OfficeDto] })
  @Get()
  async findMany(): Promise<OfficeDto[]> {
    return this.officesService.findMany();
  }

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: OfficeDto })
  @Post()
  async create(@Body() dto: CreateOfficeDto): Promise<OfficeDto> {
    return this.officesService.create(dto);
  }

  @ApiOperation({ operationId: 'findById' })
  @ApiOkResponse({ type: OfficeDto })
  @ApiNotFoundResponse()
  @Get('/:id')
  async findById(@Param('id') id: string): Promise<OfficeDto> {
    const office = await this.officesService.findOne(id);

    if (!office) {
      throw new NotFoundException();
    }

    return office;
  }
}
