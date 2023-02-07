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

  @ApiOperation({ operationId: 'findOneById' })
  @ApiOkResponse({ type: SubjectDto })
  @Get('/:id')
  async update(
    @Param('schoolId') schoolId: string,
    @Param('id') id: string,
  ): Promise<SubjectDto> {
    const subject = await this.subjectsService.findOne(schoolId, id);

    if (!subject) {
      throw new NotFoundException();
    }

    return subject;
  }
}
