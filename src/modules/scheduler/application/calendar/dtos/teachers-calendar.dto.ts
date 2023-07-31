import { ApiProperty } from '@nestjs/swagger';
import { CalendarTeacherEventDto } from './calendar-teacher-event.dto';
import { CalendarTeacherDto } from './calendar-teacher.dto';

export class TeachersCalendarDto {
  @ApiProperty({
    type: [CalendarTeacherDto],
  })
  teachers: CalendarTeacherDto[];

  @ApiProperty({
    type: [CalendarTeacherEventDto],
  })
  events: CalendarTeacherEventDto[];

  constructor(dto: TeachersCalendarDto) {
    this.teachers = dto.teachers;
    this.events = dto.events;
  }
}
