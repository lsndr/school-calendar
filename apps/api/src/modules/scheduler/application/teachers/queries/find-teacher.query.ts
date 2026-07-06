import { MikroORM } from '@mikro-orm/postgresql';
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
  public constructor(private readonly orm: MikroORM) {}

  public async execute({
    id,
    schoolId,
  }: FindTeacherQuery): Promise<TeacherDto | undefined> {
    const knex = this.orm.em.getConnection().getKnex();

    const record = await knex
      .select(['id', 'name'])
      .from('teacher')
      .where('id', id)
      .where('school_id', schoolId)
      .first();

    if (!record) {
      return;
    }

    return new TeacherDto({
      id: record.id,
      name: record.name,
    });
  }
}
