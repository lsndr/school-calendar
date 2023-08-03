import { MikroORM } from '@mikro-orm/postgresql';
import { Query, QueryHandler } from '@shared/cqrs';
import { SchoolDto } from '../dtos/school.dto';

export class FindSchoolsQuery extends Query<SchoolDto[]> {}

@QueryHandler(FindSchoolsQuery)
export class FindSchoolsQueryHandler implements QueryHandler<FindSchoolsQuery> {
  constructor(private readonly orm: MikroORM) {}

  async execute() {
    const knex = this.orm.em.getConnection().getKnex();

    const records = await knex
      .select(['id', 'time_zone', 'name'])
      .from('school');

    const schools: SchoolDto[] = [];

    for (const record of records) {
      schools.push(
        new SchoolDto({
          id: record.id,
          name: record.name,
          timeZone: record.time_zone,
        }),
      );
    }

    return schools;
  }
}
