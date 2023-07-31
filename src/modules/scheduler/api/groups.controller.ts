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
  GroupDto,
  CreateGroupDto,
  CreateGroupCommand,
  FindGroupQuery,
} from '../application';
import { CommandBus, QueryBus } from '../../shared/cqrs';
import { FindGroupsQuery } from '../application/groups/queries/find-groups.query';

@ApiTags('Groups')
@Controller('schools/:schoolId/groups')
export class GroupsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ operationId: 'findMany' })
  @ApiOkResponse({ type: [GroupDto] })
  @Get()
  findMany(@Param('schoolId') schoolId: string): Promise<GroupDto[]> {
    return this.queryBus.execute(new FindGroupsQuery({ schoolId }));
  }

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: GroupDto })
  @Post()
  create(
    @Param('schoolId') schoolId: string,
    @Body() payload: CreateGroupDto,
  ): Promise<GroupDto> {
    return this.commandBus.execute(
      new CreateGroupCommand({ schoolId, payload }),
    );
  }

  @ApiOperation({ operationId: 'findById' })
  @ApiOkResponse({ type: GroupDto })
  @ApiNotFoundResponse()
  @Get('/:id')
  async findById(
    @Param('schoolId') schoolId: string,
    @Param('id') id: string,
  ): Promise<GroupDto> {
    const group = await this.queryBus.execute(
      new FindGroupQuery({ schoolId, id }),
    );

    if (!group) {
      throw new NotFoundException();
    }

    return group;
  }
}
