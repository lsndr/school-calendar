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
  public constructor(private readonly orm: MikroORM) {}

  public async execute({
    id,
    schoolId,
  }: FindSubjectQuery): Promise<SubjectDto | undefined> {
    const knex = this.orm.em.getConnection().getKnex();

    const record = (await knex
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
      .where('id', id)
      .andWhere('school_id', schoolId)
      .first()) as SubjectRow | undefined;

    if (!record) {
      return;
    }

    return new SubjectDto({
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
    });
  }
}
