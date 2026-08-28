import { PrismaClient } from '@prisma/client';
import { Query, QueryHandler, QueryProps } from '../../../../shared/cqrs';
import { SubjectDto } from '../dtos/subject.dto';
import { mapRawRecurrenceToDto } from '../helpers/mappers';
import { TimeIntervalDto } from '../../shared';
import { DateTime } from 'luxon';

export class FindSubjectQuery extends Query<SubjectDto | undefined> {
  public readonly id: string;
  public readonly schoolId: string;

  public constructor(props: QueryProps<FindSubjectQuery>) {
    super();

    this.id = props.id;
    this.schoolId = props.schoolId;
  }
}

@QueryHandler(FindSubjectQuery)
export class FindSubjectQueryHandler implements QueryHandler<FindSubjectQuery> {
  public constructor(private readonly prisma: PrismaClient) {}

  public async execute({
    id,
    schoolId,
  }: FindSubjectQuery): Promise<SubjectDto | undefined> {
    const record = await this.prisma.subject.findFirst({
      where: { id, schoolId },
    });

    if (!record) {
      return;
    }

    return new SubjectDto({
      id: record.id,
      name: record.name,
      recurrence: mapRawRecurrenceToDto(record.recurrenceType, {
        days: record.recurrenceDays,
        week1: record.recurrenceWeek1,
        week2: record.recurrenceWeek2,
      }),
      time: new TimeIntervalDto({
        startsAt: record.timeStartsAt,
        duration: record.timeDuration,
      }),
      groupId: record.groupId,
      requiredTeachers: record.requiredTeachers,
      createdAt: DateTime.fromJSDate(record.createdAt).toISO(),
      updatedAt: DateTime.fromJSDate(record.updatedAt).toISO(),
    });
  }
}
