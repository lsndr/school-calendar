import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { LessonDto, LessonsService, CreateLessonDto } from '../application';

@ApiTags('Lessons')
@Controller('schools/:schoolId/subjects/:subjectId/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: LessonDto })
  @Post()
  create(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
    @Body() dto: CreateLessonDto,
  ): Promise<LessonDto> {
    return this.lessonsService.create(schoolId, subjectId, dto);
  }
}
