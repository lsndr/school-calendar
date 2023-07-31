import { MikroORM } from '@mikro-orm/postgresql';
import { Query, QueryHandler, QueryProps } from '../../../../shared/cqrs';
import { SchoolDto } from '../dtos/school.dto';

export class FindSchoolQuery extends Query<SchoolDto | undefined> {
  public readonly id: string;

  constructor(props: QueryProps<FindSchoolQuery>) {
    super();

    this.id = props.id;
  }
}

@QueryHandler(FindSchoolQuery)
export class FindSchoolQueryHandler implements QueryHandler<FindSchoolQuery> {
  constructor(private readonly orm: MikroORM) {}

  async execute({ id }: FindSchoolQuery) {
    const knex = this.orm.em.getConnection().getKnex();

    const record = await knex
      .select(['id', 'time_zone', 'name'])
      .from('school')
      .where('id', id)
      .first();

    if (!record) {
      return;
    }

    return new SchoolDto({
      id: record.id,
      name: record.name,
      timeZone: record.time_zone,
    });
  }
}
