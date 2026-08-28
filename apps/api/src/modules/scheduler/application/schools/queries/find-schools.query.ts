import { PrismaClient } from '@prisma/client';
import { Query, QueryHandler } from '../../../../shared/cqrs';
import { SchoolDto } from '../dtos/school.dto';

export class FindSchoolsQuery extends Query<SchoolDto[]> {}

@QueryHandler(FindSchoolsQuery)
export class FindSchoolsQueryHandler implements QueryHandler<FindSchoolsQuery> {
  public constructor(private readonly prisma: PrismaClient) {}

  public async execute(): Promise<SchoolDto[]> {
    const records = await this.prisma.school.findMany({
      select: { id: true, name: true, timeZone: true },
    });

    return records.map(
      (r) =>
        new SchoolDto({
          id: r.id,
          name: r.name,
          timeZone: r.timeZone,
        }),
    );
  }
}
