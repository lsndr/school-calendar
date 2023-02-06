import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ClientDto, ClientsService } from '../application';

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
}
