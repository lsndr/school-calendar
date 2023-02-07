import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { AttendancesController } from './api/attendances.controller';
import { ClientsController } from './api/clients.controller';
import { EmployeesController } from './api/employees.controller';
import { OfficesController } from './api/offices.controller';
import { VisitsController } from './api/visits.controller';
import {
  AttendancesService,
  ClientsService,
  EmployeesService,
  OfficesService,
  VisitsService,
} from './application';

@Module({
  imports: [SharedModule],
  providers: [
    OfficesService,
    ClientsService,
    EmployeesService,
    VisitsService,
    AttendancesService,
  ],
  controllers: [
    OfficesController,
    ClientsController,
    EmployeesController,
    VisitsController,
    AttendancesController,
  ],
  exports: [],
})
export class SchedulerModule {}
