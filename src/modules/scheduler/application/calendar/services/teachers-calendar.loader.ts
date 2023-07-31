import { MikroORM } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { LessonsLoader, Assignment } from './lessons.loader';
import { CalendarTeacherEventDto } from './../dtos/calendar-teacher-event.dto';
import { CalendarTeacherDto } from './../dtos/calendar-teacher.dto';
import { TeachersCalendarDto } from './../dtos/teachers-calendar.dto';
import {
  SubjectVersion,
  SubjectVersionsLoader,
} from './subject-versions.loader';

export type TeachersCalendarPeriodOptions = {
  schoolId: string;
  timeZone: string;
  from: DateTime;
  to: DateTime;
};

@Injectable()
export class TeachersCalendarLoader {
  constructor(
    private readonly subjectVersionsLoader: SubjectVersionsLoader,
    private readonly lessonsLoader: LessonsLoader,
    private readonly orm: MikroORM,
  ) {}

  async forPeriod(
    options: TeachersCalendarPeriodOptions,
  ): Promise<TeachersCalendarDto> {
    const [versionsIterator, teachers, lessonsIterator] = await Promise.all([
      this.subjectVersionsLoader.load(options),
      this.getTeachers(options.schoolId),
      this.lessonsLoader.load(options),
    ]);

    const versions: SubjectVersion[] = [];

    for await (const version of versionsIterator) {
      versions.push(version);
    }

    const lessonsMap = new Map<string, Assignment>();

    for await (const lesson of lessonsIterator) {
      lessonsMap.set(`${lesson.subjectId}-${lesson.date.toSQLDate()}`, lesson);
    }

    const events: CalendarTeacherEventDto[] = [];

    for (const version of versions) {
      const lesson = lessonsMap.get(
        `${version.id}-${version.date.toSQLDate()}`,
      );

      const numberOfAssignedTeachers = lesson?.teacherIds.length || 0;
      const numberOfUnassignedTeachers =
        version.requiredTeachers - numberOfAssignedTeachers;

      const startsAt = version.date
        .startOf('day')
        .plus({
          minutes: lesson ? lesson.startsAt : version.startsAt,
        })
        .toISO();

      for (let i = 0; i < numberOfUnassignedTeachers; i++) {
        events.push(
          new CalendarTeacherEventDto({
            subjectId: version.id,
            name: version.name,
            startsAt,
            duration: lesson ? lesson.duration : version.duration,
            assignedTeachers: numberOfAssignedTeachers,
            requiredTeachers: version.requiredTeachers,
          }),
        );
      }

      const teacherIds = lesson?.teacherIds || [];

      for (const teacherId of teacherIds) {
        events.push(
          new CalendarTeacherEventDto({
            subjectId: version.id,
            name: version.name,
            startsAt,
            duration: lesson ? lesson.duration : version.duration,
            assignedTeachers: numberOfAssignedTeachers,
            requiredTeachers: version.requiredTeachers,
            teacherId,
          }),
        );
      }
    }

    return {
      events,
      teachers,
    };
  }

  private async getTeachers(schoolId: string): Promise<CalendarTeacherDto[]> {
    const knex = this.orm.em.getConnection().getKnex();

    return await knex
      .select(['id', 'name'])
      .from('teacher')
      .where('school_id', schoolId);
  }
}
