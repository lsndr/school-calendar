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
import { ParseIsoDatePipe } from '../../shared/api';
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

  @ApiOperation({ operationId: 'findByDate' })
  @ApiOkResponse({ type: LessonDto })
  @ApiNotFoundResponse()
  @Get('/:date')
  async findByDate(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
    @Param('date', ParseIsoDatePipe) date: string,
  ): Promise<LessonDto> {
    const lesson = await this.lessonsService.findOne(schoolId, subjectId, date);

    if (!lesson) {
      throw new NotFoundException();
    }

    return lesson;
  }
}
