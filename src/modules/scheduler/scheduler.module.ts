import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ClientsController } from './api/clients.controller';
import { OfficesController } from './api/offices.controller';
import { ClientsService, OfficesService } from './application';

@Module({
  imports: [SharedModule],
  providers: [OfficesService, ClientsService],
  controllers: [OfficesController, ClientsController],
  exports: [],
})
export class SchedulerModule {}
