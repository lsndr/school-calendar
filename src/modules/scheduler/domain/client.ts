import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateState } from '../../shared/domain';
import { OfficeIdType, ClientIdType } from '../database';
import { ClientId } from './client-id';
import { Office } from './office';
import { OfficeId } from './office-id';

abstract class ClientState extends AggregateState {
  @PrimaryKey({ name: 'id', type: ClientIdType })
  protected _id!: ClientId;

  @Property({ name: 'name' })
  protected _name!: string;

  @Property({ name: 'office_id', type: OfficeIdType })
  protected _officeId!: OfficeId;

  @Property({ name: 'created_at' })
  protected _createdAt!: DateTime;

  @Property({ name: 'updated_at' })
  protected _updatedAt!: DateTime;

  @Property({ name: 'version', version: true })
  protected _version!: number;
}

export type CreateClient = {
  id: ClientId;
  office: Office;
  name: string;
  now: DateTime;
};

@Entity()
export class Client extends ClientState {
  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get officeId() {
    return this._officeId;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  static create(data: CreateClient) {
    const client = new this();

    client._id = data.id;
    client._name = data.name;
    client._officeId = data.office.id;
    client._createdAt = data.now;
    client._updatedAt = data.now;

    return client;
  }
}
