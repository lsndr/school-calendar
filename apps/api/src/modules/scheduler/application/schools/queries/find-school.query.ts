import { PrismaClient } from '@prisma/client';
import { Query, QueryHandler, QueryProps } from '../../../../shared/cqrs';
import { SchoolDto } from '../dtos/school.dto';

export class FindSchoolQuery extends Query<SchoolDto | undefined> {
  public readonly id: string;

  public constructor(props: QueryProps<FindSchoolQuery>) {
    super();

    this.id = props.id;
  }
}

@QueryHandler(FindSchoolQuery)
export class FindSchoolQueryHandler implements QueryHandler<FindSchoolQuery> {
  public constructor(private readonly prisma: PrismaClient) {}

  public async execute({
    id,
  }: FindSchoolQuery): Promise<SchoolDto | undefined> {
    const record = await this.prisma.school.findUnique({
      where: { id },
      select: { id: true, name: true, timeZone: true },
    });

    if (!record) {
      return;
    }

    return new SchoolDto({
      id: record.id,
      name: record.name,
      timeZone: record.timeZone,
    });
  }
}
