import { Body, Controller, Param, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import {
  GroupDto,
  CreateSubjectDto,
  SubjectDto,
  SubjectsService,
} from '../application';

@ApiTags('Subject')
@Controller('subjects/:schoolId/subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: SubjectDto })
  @Post()
  create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateSubjectDto,
  ): Promise<GroupDto> {
    return this.subjectsService.create(schoolId, dto);
  }

  @ApiOperation({ operationId: 'findMany' })
  @ApiOkResponse({ type: [SubjectDto] })
  @Get()
  findMany(@Param('schoolId') schoolId: string): Promise<SubjectDto[]> {
    return this.subjectsService.findMany(schoolId);
  }
}
