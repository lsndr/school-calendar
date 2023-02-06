import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { OfficesController } from './api/offices.controller';
import { OfficesService } from './application';

@Module({
  imports: [SharedModule],
  providers: [OfficesService],
  controllers: [OfficesController],
  exports: [],
})
export class SchedulerModule {}
