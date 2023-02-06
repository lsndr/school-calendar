import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ClientDto, ClientsService, CreateClientDto } from '../application';

@ApiTags('Clients')
@Controller('offices/:officeId/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ operationId: 'findMany' })
  @ApiOkResponse({ type: [ClientDto] })
  @Get()
  findMany(@Param('officeId') officeId: string): Promise<ClientDto[]> {
    return this.clientsService.findMany(officeId);
  }

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: ClientDto })
  @Post()
  create(
    @Param('officeId') officeId: string,
    @Body() dto: CreateClientDto,
  ): Promise<ClientDto> {
    return this.clientsService.create(officeId, dto);
  }
}
