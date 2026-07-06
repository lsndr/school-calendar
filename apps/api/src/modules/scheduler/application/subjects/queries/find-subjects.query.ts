import { MikroORM } from '@mikro-orm/postgresql';
import { DateTime } from 'luxon';
import { Query, QueryHandler, QueryProps } from '../../../../shared/cqrs';
import { SubjectDto } from '../dtos/subject.dto';
import { mapRawRecurrenceToDto } from '../helpers/mappers';
import { TimeIntervalDto } from '../../shared';

interface SubjectRow {
  id: string;
  name: string;
  recurrence_type: string;
  recurrence_days: string[] | null;
  recurrence_week1: string[] | null;
  recurrence_week2: string[] | null;
  time_starts_at: number;
  time_duration: number;
  group_id: string;
  required_teachers: number;
  created_at: DateTime;
  updated_at: DateTime;
}

export class FindSubjectsQuery extends Query<SubjectDto[]> {
  public readonly schoolId: string;

  public constructor(props: QueryProps<FindSubjectsQuery>) {
    super();

    this.schoolId = props.schoolId;
  }
}

@QueryHandler(FindSubjectsQuery)
export class FindSubjectsQueryHandler implements QueryHandler<FindSubjectsQuery> {
  public constructor(private readonly orm: MikroORM) {}

  public async execute({ schoolId }: FindSubjectsQuery): Promise<SubjectDto[]> {
    const knex = this.orm.em.getConnection().getKnex();

    const records = (await knex
      .select([
        'id',
        'name',
        'recurrence_type',
        'recurrence_days',
        'recurrence_week1',
        'recurrence_week2',
        'time_starts_at',
        'time_duration',
        'group_id',
        'required_teachers',
        'created_at',
        'updated_at',
      ])
      .from('subject')
      .where('school_id', schoolId)) as SubjectRow[];

    const subjects: SubjectDto[] = [];

    for (const record of records) {
      subjects.push(
        new SubjectDto({
          id: record.id,
          name: record.name,
          recurrence: mapRawRecurrenceToDto(record.recurrence_type, {
            days: record.recurrence_days,
            week1: record.recurrence_week1,
            week2: record.recurrence_week2,
          }),
          time: new TimeIntervalDto({
            startsAt: record.time_starts_at,
            duration: record.time_duration,
          }),
          groupId: record.group_id,
          requiredTeachers: record.required_teachers,
          createdAt: record.created_at.toISO(),
          updatedAt: record.updated_at.toISO(),
        }),
      );
    }

    return subjects;
  }
}
