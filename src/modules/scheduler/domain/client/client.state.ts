import { PrimaryKey, Property } from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateState } from '../../../shared/domain';
import { OfficeIdType, ClientIdType } from '../../database';
import { ClientId } from './client-id';
import { OfficeId } from './../office';

type CreateClientState = {
  id: ClientId;
  name: string;
  officeId: OfficeId;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export abstract class ClientState extends AggregateState {
  @PrimaryKey({ name: 'id', type: ClientIdType })
  protected _id: ClientId;

  @Property({ name: 'name' })
  protected _name: string;

  @Property({ name: 'office_id', type: OfficeIdType })
  protected _officeId: OfficeId;

  @Property({ name: 'created_at' })
  protected _createdAt: DateTime;

  @Property({ name: 'updated_at' })
  protected _updatedAt: DateTime;

  @Property({ name: 'version', version: true })
  protected _version: number;

  protected constructor(state: CreateClientState) {
    super();

    this._id = state.id;
    this._name = state.name;
    this._officeId = state.officeId;
    this._createdAt = state.createdAt;
    this._updatedAt = state.updatedAt;
    this._version = 1;
  }
}