import { PrismaClient } from '@prisma/client';
import { Query, QueryHandler, QueryProps } from '../../../../shared/cqrs';
import { TeacherDto } from '../dtos/teacher.dto';

export class FindTeacherQuery extends Query<TeacherDto | undefined> {
  public readonly id: string;
  public readonly schoolId: string;

  public constructor(props: QueryProps<FindTeacherQuery>) {
    super();

    this.id = props.id;
    this.schoolId = props.schoolId;
  }
}

@QueryHandler(FindTeacherQuery)
export class FindTeacherQueryHandler implements QueryHandler<FindTeacherQuery> {
  public constructor(private readonly prisma: PrismaClient) {}

  public async execute({
    id,
    schoolId,
  }: FindTeacherQuery): Promise<TeacherDto | undefined> {
    const record = await this.prisma.teacher.findFirst({
      where: { id, schoolId },
      select: { id: true, name: true },
    });

    if (!record) {
      return;
    }

    return new TeacherDto({
      id: record.id,
      name: record.name,
    });
  }
}
