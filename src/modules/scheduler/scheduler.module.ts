import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { GroupsController } from './api/groups.controller';
import { TeachersController } from './api/teachers.controller';
import { SchoolsController } from './api/schools.controller';
import { GroupsService, TeachersService, SchoolsService } from './application';

@Module({
  imports: [SharedModule],
  providers: [SchoolsService, TeachersService, GroupsService],
  controllers: [SchoolsController, GroupsController, TeachersController],
  exports: [],
})
export class SchedulerModule {}
