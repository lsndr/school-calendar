import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import {
  GroupDto,
  CreateSubjectDto,
  UpdateSubjectDto,
  SubjectDto,
  CreateSubjectCommand,
  FindSubjectsQuery,
  FindSubjectQuery,
  UpdateSubjectCommand,
} from '../application';
import { CommandBus, QueryBus } from '../../shared/cqrs';

@ApiTags('Subject')
@Controller('subjects/:schoolId/subjects')
export class SubjectsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: SubjectDto })
  @Post()
  create(
    @Param('schoolId') schoolId: string,
    @Body() payload: CreateSubjectDto,
  ): Promise<GroupDto> {
    return this.commandBus.execute(
      new CreateSubjectCommand({
        schoolId,
        payload,
      }),
    );
  }

  @ApiOperation({ operationId: 'findMany' })
  @ApiOkResponse({ type: [SubjectDto] })
  @Get()
  findMany(@Param('schoolId') schoolId: string): Promise<SubjectDto[]> {
    return this.queryBus.execute(new FindSubjectsQuery({ schoolId }));
  }

  @ApiOperation({ operationId: 'findOneById' })
  @ApiOkResponse({ type: SubjectDto })
  @Get('/:id')
  async findOneById(
    @Param('schoolId') schoolId: string,
    @Param('id') id: string,
  ): Promise<SubjectDto> {
    const subject = await this.queryBus.execute(
      new FindSubjectQuery({ schoolId, id }),
    );

    if (!subject) {
      throw new NotFoundException();
    }

    return subject;
  }

  @ApiOperation({ operationId: 'update' })
  @ApiOkResponse({ type: SubjectDto })
  @Patch('/:id')
  async update(
    @Param('schoolId') schoolId: string,
    @Param('id') id: string,
    @Body() payload: UpdateSubjectDto,
  ): Promise<SubjectDto> {
    const subject = await this.commandBus.execute(
      new UpdateSubjectCommand({
        schoolId,
        id,
        payload,
      }),
    );

    if (!subject) {
      throw new NotFoundException();
    }

    return subject;
  }
}
