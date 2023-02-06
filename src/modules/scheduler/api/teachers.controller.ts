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
import { TeachersService, TeacherDto, CreateTeacherDto } from '../application';

@ApiTags('Teachers')
@Controller('schools/:schoolId/teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @ApiOperation({ operationId: 'create' })
  @ApiOkResponse({ type: TeacherDto })
  @Post()
  create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateTeacherDto,
  ): Promise<TeacherDto> {
    return this.teachersService.create(schoolId, dto);
  }

  @ApiOperation({ operationId: 'findMany' })
  @ApiOkResponse({ type: [TeacherDto] })
  @Get()
  findMany(@Param('schoolId') schoolId: string): Promise<TeacherDto[]> {
    return this.teachersService.findMany(schoolId);
  }

  @ApiOperation({ operationId: 'findById' })
  @ApiOkResponse({ type: TeacherDto })
  @ApiNotFoundResponse()
  @Get('/:id')
  async findById(
    @Param('schoolId') schoolId: string,
    @Param('id') id: string,
  ): Promise<TeacherDto> {
    const teacher = await this.teachersService.findOne(schoolId, id);

    if (!teacher) {
      throw new NotFoundException();
    }

    return teacher;
  }
}
