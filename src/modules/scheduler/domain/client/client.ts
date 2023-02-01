import { Entity } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { ClientId } from './client-id';
import { ClientState } from './client.state';
import { Office } from './../office';

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
    const client = new this({
      id: data.id,
      name: data.name,
      officeId: data.office.id,
      createdAt: data.now,
      updatedAt: data.now,
    });

    return client;
  }
}
