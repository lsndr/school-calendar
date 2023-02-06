import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { SchoolsController } from './api/schools.controller';
import { SchoolsService } from './application';

@Module({
  imports: [SharedModule],
  providers: [SchoolsService],
  controllers: [SchoolsController],
  exports: [],
})
export class SchedulerModule {}
