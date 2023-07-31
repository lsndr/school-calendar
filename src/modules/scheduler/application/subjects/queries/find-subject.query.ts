import { MikroORM } from '@mikro-orm/postgresql';
import { Query, QueryHandler, QueryProps } from '../../../../shared/cqrs';
import { SubjectDto } from '../dtos/subject.dto';
import { mapRawRecurrenceToDto } from '../helpers/mappers';
import { TimeIntervalDto } from '../../shared';

export class FindSubjectQuery extends Query<SubjectDto | undefined> {
  public readonly id: string;
  public readonly schoolId: string;

  constructor(props: QueryProps<FindSubjectQuery>) {
    super();

    this.id = props.id;
    this.schoolId = props.schoolId;
  }
}

@QueryHandler(FindSubjectQuery)
export class FindSubjectQueryHandler implements QueryHandler<FindSubjectQuery> {
  constructor(private readonly orm: MikroORM) {}

  async execute({ id, schoolId }: FindSubjectQuery) {
    const knex = this.orm.em.getConnection().getKnex();

    const record = await knex
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
      .first();

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
