import { DataMapper } from 'yuow';
import { School } from '../../domain';
import { SchoolIdHydrator } from './school-id.hydrator';
import { SchoolHydrator } from './school.hydrator';
import { TimeZoneHydrator } from './time-zone.hydrator';

export interface FindOneSchoolQuery {
  id?: string;
}

export class SchoolDataMapper extends DataMapper<School> {
  async findOne(query: FindOneSchoolQuery): Promise<School | undefined> {
    const queryBuilder = this.knex
      .select([
        'id',
        'name',
        'time_zone',
        'version',
        'created_at',
        'updated_at',
      ])
      .from('schools');

    if (typeof query.id !== 'undefined') {
      queryBuilder.where('id', query.id);
    }

    const record = await queryBuilder.first();

    if (!record) {
      return;
    }

    const school = this.map(record);

    this.setVersion(school, record.version);

    return school;
  }

  async insert(school: School): Promise<boolean> {
    return this.upsert(school);
  }

  async update(school: School): Promise<boolean> {
    return this.upsert(school);
  }

  private async upsert(school: School): Promise<boolean> {
    const version = this.increaseVersion(school);

    const result: any = await this.knex
      .insert({
        id: school.id.value,
        name: school.name,
        time_zone: school.timeZone.value,
        version,
        created_at: school.createdAt.toJSDate(),
        updated_at: school.updatedAt.toJSDate(),
      })
      .into('schools')
      .onConflict('id')
      .merge()
      .where('schools.id', school.id.value)
      .andWhere('schools.version', version - 1);

    return result.rowCount > 0;
  }

  async delete(school: School): Promise<boolean> {
    const version = this.getVersion(school);

    const result: any = await this.knex
      .delete()
      .from('schools')
      .where('id', school.id.value)
      .andWhere('version', version);

    return result.rowCount > 0;
  }

  private map(record: any) {
    const id = new SchoolIdHydrator(record.id);
    const timeZone = new TimeZoneHydrator(record.time_zone);
    const createdAt = record.created_at;
    const updatedAt = record.updated_at;

    return new SchoolHydrator({
      id,
      timeZone,
      name: record.name,
      createdAt,
      updatedAt,
    });
  }
}
