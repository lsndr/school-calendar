import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GroupDto, GroupsService } from '../application';

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
}
