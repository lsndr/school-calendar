import { MikroORM } from '@mikro-orm/postgresql';
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
  public constructor(private readonly orm: MikroORM) {}

  public async execute({ schoolId }: FindTeachersQuery): Promise<TeacherDto[]> {
    const knex = this.orm.em.getConnection().getKnex();

    const records = await knex
      .select(['id', 'name'])
      .from('teacher')
      .where('school_id', schoolId);

    const teachers: TeacherDto[] = [];

    for (const record of records) {
      teachers.push(
        new TeacherDto({
          id: record.id,
          name: record.name,
        }),
      );
    }

    return teachers;
  }
}
