import { ApiProperty } from '@nestjs/swagger';
import { CalendarEmployeeEventDto } from './calendar-employee-event.dto';
import { CalendarEmployeeDto } from './calendar-employee.dto';

export class EmployeesCalendarDto {
  @ApiProperty({
    type: [CalendarEmployeeDto],
  })
  employees: CalendarEmployeeDto[];

  @ApiProperty({
    type: [CalendarEmployeeEventDto],
  })
  events: CalendarEmployeeEventDto[];

  constructor(dto: EmployeesCalendarDto) {
    this.employees = dto.employees;
    this.events = dto.events;
  }
}

/*

работники

эвенты = {
    visitId: ид визита
    type: Ассайнд / Аннасайнд
}

*/
