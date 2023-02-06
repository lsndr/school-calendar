import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ClientsController } from './api/clients.controller';
import { OfficesController } from './api/offices.controller';
import { OfficesService } from './application';

@Module({
  imports: [SharedModule],
  providers: [OfficesService],
  controllers: [OfficesController, ClientsController],
  exports: [],
})
export class SchedulerModule {}
