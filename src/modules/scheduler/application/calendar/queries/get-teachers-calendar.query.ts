import { Query, QueryHandler, QueryProps } from '../../../../shared/cqrs';
import { TeachersCalendarDto } from './../dtos/teachers-calendar.dto';
import { TeachersCalendarFiltersDto } from '../dtos/teachers-calendar-filters.dto';
import { TeachersCalendarLoader } from '../services/teachers-calendar.loader';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';

export class GetTeachersCalendarQuery extends Query<TeachersCalendarDto> {
  public readonly schoolId: string;
  public readonly filters: TeachersCalendarFiltersDto;

  constructor(props: QueryProps<GetTeachersCalendarQuery>) {
    super();

    this.schoolId = props.schoolId;
    this.filters = props.filters;
  }
}

@QueryHandler(GetTeachersCalendarQuery)
export class GetTeachersCalendarQueryHandler
  implements QueryHandler<GetTeachersCalendarQuery>
{
  constructor(
    private readonly loader: TeachersCalendarLoader,
    private readonly orm: MikroORM,
  ) {}

  async execute({ schoolId, filters }: GetTeachersCalendarQuery) {
    const knex = this.orm.em.getConnection().getKnex();

    const school = await knex
      .select(['id', 'time_zone'])
      .from('school')
      .where('id', schoolId)
      .first();

    if (!school) {
      throw new Error('School not found');
    }

    const from = DateTime.fromISO(filters.startDate, {
      zone: school.time_zone,
    }).startOf('day');

    const to = from.plus({ day: filters.days });

    return this.loader.forPeriod({
      schoolId: school.id,
      from,
      to,
      timeZone: school.time_zone,
    });
  }
}
