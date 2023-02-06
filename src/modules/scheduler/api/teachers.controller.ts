import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
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
}
