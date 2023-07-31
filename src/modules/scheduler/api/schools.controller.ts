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
import {
  CreateSchoolCommand,
  CreateSchoolDto,
  FindSchoolQuery,
  FindSchoolsQuery,
  SchoolDto,
} from '../application';
import { CommandBus, QueryBus } from '../../shared/cqrs';

@ApiTags('Schools')
@Controller('schools')
export class SchoolsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ operationId: 'findMany' })
  @ApiOkResponse({ type: [SchoolDto] })
  @Get()
  async findMany(): Promise<SchoolDto[]> {
    return await this.queryBus.execute(new FindSchoolsQuery());
  }

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: SchoolDto })
  @Post()
  async create(@Body() payload: CreateSchoolDto): Promise<SchoolDto> {
    return await this.commandBus.execute(new CreateSchoolCommand({ payload }));
  }

  @ApiOperation({ operationId: 'findById' })
  @ApiOkResponse({ type: SchoolDto })
  @ApiNotFoundResponse()
  @Get('/:id')
  async findById(@Param('id') id: string): Promise<SchoolDto> {
    const school = await this.queryBus.execute(new FindSchoolQuery({ id }));

    if (!school) {
      throw new NotFoundException();
    }

    return school;
  }
}
