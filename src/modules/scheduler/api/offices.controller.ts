import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { OfficeDto, OfficesService } from '../application';

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
}
