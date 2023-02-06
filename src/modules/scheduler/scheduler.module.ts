import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { GroupsController } from './api/groups.controller';
import { SchoolsController } from './api/schools.controller';
import { SchoolsService, GroupsService } from './application';

@Module({
  imports: [SharedModule],
  providers: [SchoolsService, GroupsService],
  controllers: [SchoolsController, GroupsController],
  exports: [],
})
export class SchedulerModule {}
