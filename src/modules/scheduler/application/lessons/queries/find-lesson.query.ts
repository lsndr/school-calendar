import { MikroORM } from '@mikro-orm/postgresql';
import { Query, QueryHandler, QueryProps } from '@shared/cqrs';
import { LessonDto } from '../dtos/lesson.dto';
import { DateTime } from 'luxon';
import { AssignedTeacherDto } from '../dtos/assigned-teacher.dto';
import { TimeIntervalDto } from '../../shared';

export class FindLessonQuery extends Query<LessonDto | undefined> {
  public readonly schoolId: string;
  public readonly subjectId: string;
  public readonly date: string;

  constructor(props: QueryProps<FindLessonQuery>) {
    super();

    this.schoolId = props.schoolId;
    this.subjectId = props.subjectId;
    this.date = props.date;
  }
}

@QueryHandler(FindLessonQuery)
export class FindLessonQueryHandler implements QueryHandler<FindLessonQuery> {
  constructor(private readonly orm: MikroORM) {}

  async execute({ schoolId, subjectId, date }: FindLessonQuery) {
    const knex = this.orm.em.getConnection().getKnex();

    const lessonRecord = await knex
      .select([
        'lesson.date',
        'lesson.subject_id',
        'lesson.time_starts_at',
        'lesson.time_duration',
        'lesson.created_at',
        'lesson.updated_at',
        knex
          .select(
            knex.raw(
              `ARRAY_AGG(json_build_object('teacher_id', lesson_teacher.teacher_id, 'assigned_at', lesson_teacher.assigned_at))`,
            ),
          )
          .from('lesson_teacher')
          .whereRaw('lesson_teacher.lesson_id = lesson.id')
          .as('assigned_teachers'),
      ])
      .from('lesson')
      .where('lesson.subject_id', subjectId)
      .where('lesson.school_id', schoolId)
      .where('lesson.date', date)
      .first();

    if (!lessonRecord) {
      return;
    }

    const assignedTeachers = (lessonRecord.assigned_teachers || []).map(
      (teacher: any) =>
        new AssignedTeacherDto({
          teacherId: teacher.teacher_id,
          assignedAt: DateTime.fromISO(teacher.assigned_at).toISO(),
        }),
    );

    return new LessonDto({
      assignedTeachers,
      subjectId: lessonRecord.subject_id,
      date: lessonRecord.date.toISODate(),
      time: new TimeIntervalDto({
        startsAt: lessonRecord.time_starts_at,
        duration: lessonRecord.time_duration,
      }),
      updatedAt: lessonRecord.updated_at.toISO(),
      createdAt: lessonRecord.created_at.toISO(),
    });
  }
}
