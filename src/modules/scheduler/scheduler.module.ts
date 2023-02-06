import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ClientsController } from './api/clients.controller';
import { EmployeesController } from './api/employees.controller';
import { OfficesController } from './api/offices.controller';
import {
  ClientsService,
  EmployeesService,
  OfficesService,
} from './application';

@Module({
  imports: [SharedModule],
  providers: [OfficesService, ClientsService, EmployeesService],
  controllers: [OfficesController, ClientsController, EmployeesController],
  exports: [],
})
export class SchedulerModule {}
