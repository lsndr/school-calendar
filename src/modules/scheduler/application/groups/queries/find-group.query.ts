import { MikroORM } from '@mikro-orm/postgresql';
import { Query, QueryHandler, QueryProps } from '@shared/cqrs';
import { GroupDto } from '../dtos/group.dto';

export class FindGroupQuery extends Query<GroupDto | undefined> {
  public readonly schoolId: string;
  public readonly id: string;

  constructor(props: QueryProps<FindGroupQuery>) {
    super();

    this.id = props.id;
    this.schoolId = props.schoolId;
  }
}

@QueryHandler(FindGroupQuery)
export class FindGroupQueryHandler implements QueryHandler<FindGroupQuery> {
  constructor(private readonly orm: MikroORM) {}

  async execute({ schoolId, id }: FindGroupQuery) {
    const knex = this.orm.em.getConnection().getKnex();

    const record = await knex
      .select(['id', 'name'])
      .from('group')
      .where('school_id', schoolId)
      .where('id', id)
      .first();

    if (!record) {
      return;
    }

    return new GroupDto({
      id: record.id,
      name: record.name,
    });
  }
}
