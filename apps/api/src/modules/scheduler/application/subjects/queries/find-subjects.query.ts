import { PrismaClient } from '@prisma/client';
import { Query, QueryHandler, QueryProps } from '../../../../shared/cqrs';
import { SubjectDto } from '../dtos/subject.dto';
import { mapRawRecurrenceToDto } from '../helpers/mappers';
import { TimeIntervalDto } from '../../shared';
import { DateTime } from 'luxon';

export class FindSubjectsQuery extends Query<SubjectDto[]> {
  public readonly schoolId: string;

  public constructor(props: QueryProps<FindSubjectsQuery>) {
    super();

    this.schoolId = props.schoolId;
  }
}

@QueryHandler(FindSubjectsQuery)
export class FindSubjectsQueryHandler implements QueryHandler<FindSubjectsQuery> {
  public constructor(private readonly prisma: PrismaClient) {}

  public async execute({ schoolId }: FindSubjectsQuery): Promise<SubjectDto[]> {
    const records = await this.prisma.subject.findMany({
      where: { schoolId },
    });

    return records.map(
      (r) =>
        new SubjectDto({
          id: r.id,
          name: r.name,
          recurrence: mapRawRecurrenceToDto(r.recurrenceType, {
            days: r.recurrenceDays,
            week1: r.recurrenceWeek1,
            week2: r.recurrenceWeek2,
          }),
          time: new TimeIntervalDto({
            startsAt: r.timeStartsAt,
            duration: r.timeDuration,
          }),
          groupId: r.groupId,
          requiredTeachers: r.requiredTeachers,
          createdAt: DateTime.fromJSDate(r.createdAt).toISO(),
          updatedAt: DateTime.fromJSDate(r.updatedAt).toISO(),
        }),
    );
  }
}
