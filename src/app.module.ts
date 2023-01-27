import { Module } from '@nestjs/common';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [SchedulerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
