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
  TeacherDto,
  CreateTeacherDto,
  CreateTeacherCommand,
  FindTeachersQuery,
  FindTeacherQuery,
} from '../application';
import { CommandBus, QueryBus } from '../../shared/cqrs';

@ApiTags('Teachers')
@Controller('schools/:schoolId/teachers')
export class TeachersController {
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: TeacherDto })
  @Post()
  public create(
    @Param('schoolId') schoolId: string,
    @Body() payload: CreateTeacherDto,
  ): Promise<TeacherDto> {
    return this.commandBus.execute(
      new CreateTeacherCommand({ schoolId, payload }),
    );
  }

  @ApiOperation({ operationId: 'findMany' })
  @ApiOkResponse({ type: [TeacherDto] })
  @Get()
  public findMany(@Param('schoolId') schoolId: string): Promise<TeacherDto[]> {
    return this.queryBus.execute(new FindTeachersQuery({ schoolId }));
  }

  @ApiOperation({ operationId: 'findById' })
  @ApiOkResponse({ type: TeacherDto })
  @ApiNotFoundResponse()
  @Get('/:id')
  public async findById(
    @Param('schoolId') schoolId: string,
    @Param('id') id: string,
  ): Promise<TeacherDto> {
    const teacher = await this.queryBus.execute(
      new FindTeacherQuery({ schoolId, id }),
    );

    if (!teacher) {
      throw new NotFoundException();
    }

    return teacher;
  }
}
