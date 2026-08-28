import { PrismaClient } from '@prisma/client';
import { Query, QueryHandler, QueryProps } from '../../../../shared/cqrs';
import { LessonDto } from '../dtos/lesson.dto';
import { DateTime } from 'luxon';
import { AssignedTeacherDto } from '../dtos/assigned-teacher.dto';
import { TimeIntervalDto } from '../../shared';

export class FindLessonQuery extends Query<LessonDto | undefined> {
  public readonly schoolId: string;
  public readonly subjectId: string;
  public readonly date: string;

  public constructor(props: QueryProps<FindLessonQuery>) {
    super();

    this.schoolId = props.schoolId;
    this.subjectId = props.subjectId;
    this.date = props.date;
  }
}

@QueryHandler(FindLessonQuery)
export class FindLessonQueryHandler implements QueryHandler<FindLessonQuery> {
  public constructor(private readonly prisma: PrismaClient) {}

  public async execute({
    schoolId,
    subjectId,
    date,
  }: FindLessonQuery): Promise<LessonDto | undefined> {
    const [year, month, day] = date.split('-').map(Number) as [
      number,
      number,
      number,
    ];
    const dateValue = new Date(Date.UTC(year, month - 1, day));

    const record = await this.prisma.lesson.findFirst({
      where: { subjectId, schoolId, date: dateValue },
      include: { teachers: true },
    });

    if (!record) {
      return;
    }

    const assignedTeachers = record.teachers.map(
      (t) =>
        new AssignedTeacherDto({
          teacherId: t.teacherId,
          assignedAt: DateTime.fromJSDate(t.assignedAt).toISO(),
        }),
    );

    return new LessonDto({
      assignedTeachers,
      subjectId: record.subjectId!,
      date: new Date(
        Date.UTC(
          record.date.getUTCFullYear(),
          record.date.getUTCMonth(),
          record.date.getUTCDate(),
        ),
      )
        .toISOString()
        .split('T')[0]!,
      time: new TimeIntervalDto({
        startsAt: record.timeStartsAt,
        duration: record.timeDuration,
      }),
      updatedAt: DateTime.fromJSDate(record.updatedAt).toISO(),
      createdAt: DateTime.fromJSDate(record.createdAt).toISO(),
    });
  }
}
