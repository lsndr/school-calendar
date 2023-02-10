import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { GroupsController } from './api/groups.controller';
import { TeachersController } from './api/teachers.controller';
import { SchoolsController } from './api/schools.controller';
import { SubjectsController } from './api/subjects.controller';
import { LessonsController } from './api/lessons.controller';
import { CalendarController } from './api/calendar.controller';
import {
  LessonsService,
  GroupsService,
  TeachersService,
  SchoolsService,
  SubjectsService,
} from './application';
import {
  LessonsLoader,
  TeachersCalendarLoader,
  TeachersCalendarService,
  SubjectVersionsLoader,
} from './application/calendar';

@Module({
  imports: [SharedModule],
  providers: [
    SchoolsService,
    GroupsService,
    TeachersService,
    SubjectsService,
    LessonsService,
    TeachersCalendarService,
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
