import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { GroupsController } from './api/groups.controller';
import { TeachersController } from './api/teachers.controller';
import { SchoolsController } from './api/schools.controller';
import { SubjectsController } from './api/subjects.controller';
import { LessonsController } from './api/lessons.controller';
import { CalendarController } from './api/calendar.controller';
import {
  LessonsLoader,
  TeachersCalendarLoader,
  SubjectVersionsLoader,
  CreateGroupCommandHandler,
  GetTeachersCalendarQueryHandler,
  FindGroupQueryHandler,
  FindGroupsQueryHandler,
  AssignTeachersCommandHandler,
  CreateLessonCommandHandler,
  UnassignTeachersCommandHandler,
  UpdateLessonCommandHandler,
  FindLessonQuery,
  CreateSchoolCommandHandler,
  FindSchoolQueryHandler,
  FindSchoolsQueryHandler,
  CreateSubjectCommandHandler,
  UpdateSubjectCommandHandler,
  FindSubjectQueryHandler,
  FindSubjectsQueryHandler,
  CreateTeacherCommandHandler,
  FindTeacherQueryHandler,
  FindTeachersQueryHandler,
} from './application';

@Module({
  imports: [SharedModule],
  providers: [
    CreateGroupCommandHandler,
    AssignTeachersCommandHandler,
    CreateLessonCommandHandler,
    UnassignTeachersCommandHandler,
    UpdateLessonCommandHandler,
    CreateSchoolCommandHandler,
    CreateSubjectCommandHandler,
    UpdateSubjectCommandHandler,
    CreateTeacherCommandHandler,
    GetTeachersCalendarQueryHandler,
    FindGroupQueryHandler,
    FindGroupsQueryHandler,
    FindSchoolQueryHandler,
    FindSchoolsQueryHandler,
    FindSubjectQueryHandler,
    FindSubjectsQueryHandler,
    FindTeacherQueryHandler,
    FindTeachersQueryHandler,
    FindLessonQuery,
    SubjectVersionsLoader,
    LessonsLoader,
    TeachersCalendarLoader,
  ],
  controllers: [
    SchoolsController,
    GroupsController,
    TeachersController,
    SubjectsController,
    LessonsController,
    CalendarController,
  ],
  exports: [],
})
export class SchedulerModule {}
