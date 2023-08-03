import { Module } from '@nestjs/common';
import { SchedulerModule } from '@scheduler/core';

@Module({
  imports: [SchedulerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
