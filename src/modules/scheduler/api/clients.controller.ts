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

  @ApiOperation({ operationId: 'findById' })
  @ApiOkResponse({ type: ClientDto })
  @ApiNotFoundResponse()
  @Get('/:id')
  async findById(
    @Param('officeId') officeId: string,
    @Param('id') id: string,
  ): Promise<ClientDto> {
    const client = await this.clientsService.findOne(officeId, id);

    if (!client) {
      throw new NotFoundException();
    }

    return client;
  }
}
