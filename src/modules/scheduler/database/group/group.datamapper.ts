import { DataMapper } from 'yuow';
import { Group } from '../../domain';
import { SchoolIdHydrator } from '../school';
import { GroupIdHydrator } from './group-id.hydrator';
import { GroupHydrator } from './group.hydrator';

export interface FindOneGroupQuery {
  id?: string;
  schoolId?: string;
}

export class GroupDataMapper extends DataMapper<Group> {
  async findOne(query: FindOneGroupQuery): Promise<Group | undefined> {
    const queryBuilder = this.knex
      .select([
        'id',
        'name',
        'school_id',
        'version',
        'created_at',
        'updated_at',
      ])
      .from('groups');

    if (typeof query.id !== 'undefined') {
      queryBuilder.where('id', query.id);
    }

    if (typeof query.schoolId !== 'undefined') {
      queryBuilder.where('school_id', query.schoolId);
    }

    const record = await queryBuilder.first();

    if (!record) {
      return;
    }

    const group = this.map(record);

    this.setVersion(group, record.version);

    return group;
  }

  async insert(group: Group): Promise<boolean> {
    return this.upsert(group);
  }

  async update(group: Group): Promise<boolean> {
    return this.upsert(group);
  }

  private async upsert(group: Group): Promise<boolean> {
    const version = this.increaseVersion(group);

    const result: any = await this.knex
      .insert({
        id: group.id.value,
        name: group.name,
        school_id: group.schoolId.value,
        version,
        created_at: group.createdAt.toUTC().toSQL(),
        updated_at: group.updatedAt.toUTC().toSQL(),
      })
      .into('groups')
      .onConflict('id')
      .merge()
      .where('groups.id', group.id.value)
      .andWhere('groups.version', version - 1);

    return result.rowCount > 0;
  }

  async delete(group: Group): Promise<boolean> {
    const version = this.getVersion(group);

    const result: any = await this.knex
      .delete()
      .from('groups')
      .where('groups.id', group.id.value)
      .andWhere('groups.version', version);

    return result.rowCount > 0;
  }

  private map(record: any) {
    const id = new GroupIdHydrator(record.id);
    const schoolId = new SchoolIdHydrator(record.school_id);
    const createdAt = record.created_at;
    const updatedAt = record.updated_at;

    return new GroupHydrator({
      id,
      name: record.name,
      schoolId,
      createdAt,
      updatedAt,
    });
  }
}
