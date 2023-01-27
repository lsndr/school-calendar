import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { KNEX_PROVIDER } from '../../../../shared/database';
import { LessonsLoader, LessonDates, Assignment } from './lessons.loader';
import { CalendarTeacherEventDto } from './calendar-teacher-event.dto';
import { CalendarTeacherDto } from './calendar-teacher.dto';
import { TeachersCalendarDto } from './teachers-calendar.dto';
import {
  SubjectVersion,
  SubjectVersionsLoader,
} from './subject-versions.loader';

export type TeachersCalendarPeriod = {
  schoolId: string;
  timeZone: string;
  from: DateTime;
  to: DateTime;
};

@Injectable()
export class TeachersCalendarLoader {
  constructor(
    @Inject(KNEX_PROVIDER) private readonly knex: Knex,
    private readonly subjectVersionsLoader: SubjectVersionsLoader,
    private readonly lessonsLoader: LessonsLoader,
  ) {}

  async forPeriod(
    period: TeachersCalendarPeriod,
  ): Promise<TeachersCalendarDto> {
    const [versionsIterator, teachers] = await Promise.all([
      this.subjectVersionsLoader.load(period),
      this.getTeachers(period.schoolId),
    ]);

    const versions: SubjectVersion[] = [];
    const lessonsDates = new Map<string, LessonDates>();

    for await (const version of versionsIterator) {
      const lessonDates = lessonsDates.get(version.id) || {
        subjectId: version.id,
        dates: [],
      };

      lessonDates.dates.push(version.date);
      lessonsDates.set(version.id, lessonDates);

      versions.push(version);
    }

    const assignmentsIterator = await this.lessonsLoader.load(
      period.timeZone,
      lessonsDates.values(),
    );

    const lessonsMap = new Map<string, Assignment>();

    for await (const assignment of assignmentsIterator) {
      lessonsMap.set(
        `${assignment.subjectId}-${assignment.date.toSQLDate()}`,
        assignment,
      );
    }

    const events: CalendarTeacherEventDto[] = [];

    for (const version of versions) {
      const lesson = lessonsMap.get(
        `${version.id}-${version.date.toSQLDate()}`,
      );

      const numberOfAssignedTeachers = lesson?.teacherIds.length || 0;
      const numberOfUnassignedTeachers =
        version.requiredTeachers - numberOfAssignedTeachers;

      // если существует атенданс, то берем его время

      const startsAt = version.date
        .startOf('day')
        .plus({
          minutes: lesson ? lesson.startsAt : version.startsAt,
        })
        .toISO();

      for (let i = 0; i < numberOfUnassignedTeachers; i++) {
        events.push({
          subjectId: version.id,
          name: version.name,
          startsAt,
          duration: lesson ? lesson.duration : version.duration,
          assignedTeachers: numberOfAssignedTeachers,
          requiredTeachers: version.requiredTeachers,
        });
      }

      const teacherIds = lesson?.teacherIds || [];

      for (const teacherId of teacherIds) {
        events.push({
          subjectId: version.id,
          name: version.name,
          startsAt,
          duration: lesson ? lesson.duration : version.duration,
          assignedTeachers: numberOfAssignedTeachers,
          requiredTeachers: version.requiredTeachers,
          teacherId,
        });
      }
    }

    return {
      events,
      teachers,
    };
  }

  private async getTeachers(schoolId: string): Promise<CalendarTeacherDto[]> {
    return await this.knex
      .select(['id', 'name'])
      .from('teachers')
      .where('school_id', schoolId);
  }
}
