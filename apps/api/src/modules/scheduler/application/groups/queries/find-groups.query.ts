import { PrismaClient } from '@prisma/client';
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
  public constructor(private readonly prisma: PrismaClient) {}

  public async execute({ schoolId }: FindGroupsQuery): Promise<GroupDto[]> {
    const records = await this.prisma.group.findMany({
      where: { schoolId },
      select: { id: true, name: true },
    });

    return records.map(
      (r) =>
        new GroupDto({
          id: r.id,
          name: r.name,
        }),
    );
  }
}
