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
import { GroupDto, GroupsService, CreateGroupDto } from '../application';

@ApiTags('Groups')
@Controller('schools/:schoolId/groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiOperation({ operationId: 'findMany' })
  @ApiOkResponse({ type: [GroupDto] })
  @Get()
  findMany(@Param('schoolId') schoolId: string): Promise<GroupDto[]> {
    return this.groupsService.findMany(schoolId);
  }

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: GroupDto })
  @Post()
  create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateGroupDto,
  ): Promise<GroupDto> {
    return this.groupsService.create(schoolId, dto);
  }

  @ApiOperation({ operationId: 'findById' })
  @ApiOkResponse({ type: GroupDto })
  @ApiNotFoundResponse()
  @Get('/:id')
  async findById(
    @Param('schoolId') schoolId: string,
    @Param('id') id: string,
  ): Promise<GroupDto> {
    const group = await this.groupsService.findOne(schoolId, id);

    if (!group) {
      throw new NotFoundException();
    }

    return group;
  }
}
