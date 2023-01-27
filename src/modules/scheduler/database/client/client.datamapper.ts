import { DataMapper } from 'yuow';
import { Client } from '../../domain';
import { OfficeIdHydrator } from '../office';
import { ClientIdHydrator } from './client-id.hydrator';
import { ClientHydrator } from './client.hydrator';

export interface FindOneClientQuery {
  id?: string;
  officeId?: string;
}

export class ClientDataMapper extends DataMapper<Client> {
  async findOne(query: FindOneClientQuery): Promise<Client | undefined> {
    const queryBuilder = this.knex
      .select([
        'id',
        'name',
        'office_id',
        'version',
        'created_at',
        'updated_at',
      ])
      .from('clients');

    if (typeof query.id !== 'undefined') {
      queryBuilder.where('id', query.id);
    }

    if (typeof query.officeId !== 'undefined') {
      queryBuilder.where('office_id', query.officeId);
    }

    const record = await queryBuilder.first();

    if (!record) {
      return;
    }

    const client = this.map(record);

    this.setVersion(client, record.version);

    return client;
  }

  async insert(client: Client): Promise<boolean> {
    return this.upsert(client);
  }

  async update(client: Client): Promise<boolean> {
    return this.upsert(client);
  }

  private async upsert(client: Client): Promise<boolean> {
    const version = this.increaseVersion(client);

    const result: any = await this.knex
      .insert({
        id: client.id.value,
        name: client.name,
        office_id: client.officeId.value,
        version,
        created_at: client.createdAt.toSQL(),
        updated_at: client.updatedAt.toSQL(),
      })
      .into('clients')
      .onConflict('id')
      .merge()
      .where('clients.id', client.id.value)
      .andWhere('clients.version', version - 1);

    return result.rowCount > 0;
  }

  async delete(client: Client): Promise<boolean> {
    const version = this.getVersion(client);

    const result: any = await this.knex
      .delete()
      .from('clients')
      .where('clients.id', client.id.value)
      .andWhere('clients.version', version);

    return result.rowCount > 0;
  }

  private map(record: any) {
    const id = new ClientIdHydrator(record.id);
    const officeId = new OfficeIdHydrator(record.office_id);
    const createdAt = record.created_at;
    const updatedAt = record.updated_at;

    return new ClientHydrator({
      id,
      name: record.name,
      officeId,
      createdAt,
      updatedAt,
    });
  }
}
