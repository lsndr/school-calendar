import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { GroupsController } from './api/groups.controller';
import { TeachersController } from './api/teachers.controller';
import { SchoolsController } from './api/schools.controller';
import { SubjectsController } from './api/subjects.controller';
import {
  GroupsService,
  TeachersService,
  SchoolsService,
  SubjectsService,
} from './application';

@Module({
  imports: [SharedModule],
  providers: [SchoolsService, GroupsService, TeachersService, SubjectsService],
  controllers: [
    SchoolsController,
    GroupsController,
    TeachersController,
    SubjectsController,
  ],
  exports: [],
})
export class SchedulerModule {}
