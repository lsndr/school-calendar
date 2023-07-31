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
import {
  AssignedTeacherDto,
  AssignTeachersDto,
  LessonDto,
  CreateLessonDto,
  UnassignTeachersDto,
  CreateLessonCommand,
  FindLessonQuery,
  AssignTeachersCommand,
  UnassignTeachersCommand,
} from '../application';
import { CommandBus, QueryBus } from '../../shared/cqrs';

@ApiTags('Lessons')
@Controller('schools/:schoolId/subjects/:subjectId/lessons')
export class LessonsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: LessonDto })
  @Post()
  create(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
    @Body() dto: CreateLessonDto,
  ): Promise<LessonDto> {
    return this.commandBus.execute(
      new CreateLessonCommand(schoolId, subjectId, dto),
    );
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
    const lesson = await this.queryBus.execute(
      new FindLessonQuery({ schoolId, subjectId, date }),
    );

    if (!lesson) {
      throw new NotFoundException();
    }

    return lesson;
  }

  @ApiOperation({ operationId: 'assignTeachers' })
  @ApiOkResponse({ type: LessonDto })
  @ApiNotFoundResponse()
  @Post('/:date/assign-teachers')
  assingTeachers(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
    @Param('date', ParseIsoDatePipe) date: string,
    @Body() payload: AssignTeachersDto,
  ): Promise<AssignedTeacherDto[]> {
    return this.commandBus.execute(
      new AssignTeachersCommand({
        schoolId,
        subjectId,
        date,
        payload,
      }),
    );
  }

  @ApiOperation({ operationId: 'unassignTeachers' })
  @ApiOkResponse({ type: LessonDto })
  @ApiNotFoundResponse()
  @Post('/:date/unassign-teachers')
  unassingTeachers(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
    @Param('date', ParseIsoDatePipe) date: string,
    @Body() payload: UnassignTeachersDto,
  ): Promise<AssignedTeacherDto[]> {
    return this.commandBus.execute(
      new UnassignTeachersCommand({ schoolId, subjectId, date, payload }),
    );
  }
}
