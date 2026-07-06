import { MikroORM } from '@mikro-orm/postgresql';
import { Query, QueryHandler, QueryProps } from '../../../../shared/cqrs';
import { GroupDto } from '../dtos/group.dto';

export class FindGroupsQuery extends Query<GroupDto[]> {
  public readonly schoolId: string;

  public constructor(props: QueryProps<FindGroupsQuery>) {
    super();

    this.schoolId = props.schoolId;
  }
}

@QueryHandler(FindGroupsQuery)
export class FindGroupsQueryHandler implements QueryHandler<FindGroupsQuery> {
  public constructor(private readonly orm: MikroORM) {}

  public async execute({ schoolId }: FindGroupsQuery): Promise<GroupDto[]> {
    const knex = this.orm.em.getConnection().getKnex();

    const records = await knex
      .select(['id', 'name'])
      .from('group')
      .where('school_id', schoolId);

    const groups: GroupDto[] = [];

    for (const record of records) {
      groups.push(
        new GroupDto({
          id: record.id,
          name: record.name,
        }),
      );
    }

    return groups;
  }
}
