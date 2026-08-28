import { PrismaClient } from '@prisma/client';
import { Query, QueryHandler, QueryProps } from '../../../../shared/cqrs';
import { GroupDto } from '../dtos/group.dto';

export class FindGroupQuery extends Query<GroupDto | undefined> {
  public readonly schoolId: string;
  public readonly id: string;

  public constructor(props: QueryProps<FindGroupQuery>) {
    super();

    this.id = props.id;
    this.schoolId = props.schoolId;
  }
}

@QueryHandler(FindGroupQuery)
export class FindGroupQueryHandler implements QueryHandler<FindGroupQuery> {
  public constructor(private readonly prisma: PrismaClient) {}

  public async execute({
    schoolId,
    id,
  }: FindGroupQuery): Promise<GroupDto | undefined> {
    const record = await this.prisma.group.findFirst({
      where: { id, schoolId },
      select: { id: true, name: true },
    });

    if (!record) {
      return;
    }

    return new GroupDto({
      id: record.id,
      name: record.name,
    });
  }
}
