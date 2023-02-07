import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import {
  ClientDto,
  CreateVisitDto,
  VisitDto,
  VisitsService,
} from '../application';

@ApiTags('Visits')
@Controller('offices/:officeId/visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: VisitDto })
  @Post()
  create(
    @Param('officeId') officeId: string,
    @Body() dto: CreateVisitDto,
  ): Promise<ClientDto> {
    return this.visitsService.create(officeId, dto);
  }

  @ApiOperation({ operationId: 'findMany' })
  @ApiOkResponse({ type: [VisitDto] })
  @Get()
  async findMany(@Param('officeId') officeId: string): Promise<VisitDto[]> {
    return this.visitsService.findMany(officeId);
  }

  @ApiOperation({ operationId: 'findOneById' })
  @ApiOkResponse({ type: VisitDto })
  @Get('/:id')
  async update(
    @Param('officeId') officeId: string,
    @Param('id') id: string,
  ): Promise<VisitDto> {
    const visit = await this.visitsService.findOne(officeId, id);

    if (!visit) {
      throw new NotFoundException();
    }

    return visit;
  }
}
