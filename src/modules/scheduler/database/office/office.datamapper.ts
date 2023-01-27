import { DataMapper } from 'yuow';
import { Office } from '../../domain';
import { OfficeIdHydrator } from './office-id.hydrator';
import { OfficeHydrator } from './office.hydrator';
import { TimeZoneHydrator } from './time-zone.hydrator';

export interface FindOneOfficeQuery {
  id?: string;
}

export class OfficeDataMapper extends DataMapper<Office> {
  async findOne(query: FindOneOfficeQuery): Promise<Office | undefined> {
    const queryBuilder = this.knex
      .select([
        'id',
        'name',
        'time_zone',
        'version',
        'created_at',
        'updated_at',
      ])
      .from('offices');

    if (typeof query.id !== 'undefined') {
      queryBuilder.where('id', query.id);
    }

    const record = await queryBuilder.first();

    if (!record) {
      return;
    }

    const office = this.map(record);

    this.setVersion(office, record.version);

    return office;
  }

  async insert(office: Office): Promise<boolean> {
    return this.upsert(office);
  }

  async update(office: Office): Promise<boolean> {
    return this.upsert(office);
  }

  private async upsert(office: Office): Promise<boolean> {
    const version = this.increaseVersion(office);

    const result: any = await this.knex
      .insert({
        id: office.id.value,
        name: office.name,
        time_zone: office.timeZone.value,
        version,
        created_at: office.createdAt.toJSDate(),
        updated_at: office.updatedAt.toJSDate(),
      })
      .into('offices')
      .onConflict('id')
      .merge()
      .where('offices.id', office.id.value)
      .andWhere('offices.version', version - 1);

    return result.rowCount > 0;
  }

  async delete(office: Office): Promise<boolean> {
    const version = this.getVersion(office);

    const result: any = await this.knex
      .delete()
      .from('offices')
      .where('id', office.id.value)
      .andWhere('version', version);

    return result.rowCount > 0;
  }

  private map(record: any) {
    const id = new OfficeIdHydrator(record.id);
    const timeZone = new TimeZoneHydrator(record.time_zone);
    const createdAt = record.created_at;
    const updatedAt = record.updated_at;

    return new OfficeHydrator({
      id,
      timeZone,
      name: record.name,
      createdAt,
      updatedAt,
    });
  }
}
