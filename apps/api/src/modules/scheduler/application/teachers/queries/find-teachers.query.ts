import { PrismaClient } from '@prisma/client';
import { Query, QueryHandler, QueryProps } from '../../../../shared/cqrs';
import { TeacherDto } from '../dtos/teacher.dto';

export class FindTeachersQuery extends Query<TeacherDto[]> {
  public readonly schoolId: string;

  public constructor(props: QueryProps<FindTeachersQuery>) {
    super();

    this.schoolId = props.schoolId;
  }
}

@QueryHandler(FindTeachersQuery)
export class FindTeachersQueryHandler implements QueryHandler<FindTeachersQuery> {
  public constructor(private readonly prisma: PrismaClient) {}

  public async execute({ schoolId }: FindTeachersQuery): Promise<TeacherDto[]> {
    const records = await this.prisma.teacher.findMany({
      where: { schoolId },
      select: { id: true, name: true },
    });

    return records.map(
      (r) =>
        new TeacherDto({
          id: r.id,
          name: r.name,
        }),
    );
  }
}
