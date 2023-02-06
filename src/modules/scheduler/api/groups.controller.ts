import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
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
}
