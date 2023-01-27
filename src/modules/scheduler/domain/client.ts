import { DateTime } from 'luxon';
import { Aggregate, AggregateState } from '../../shared/domain';
import { ClientId } from './client-id';
import { Office } from './office';
import { OfficeId } from './office-id';

export interface ClientState extends AggregateState<ClientId> {
  name: string;
  officeId: OfficeId;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export type CreateClient = {
  id: ClientId;
  office: Office;
  name: string;
  now: DateTime;
};

export class Client extends Aggregate<ClientId, ClientState> {
  get name() {
    return this.state.name;
  }

  get officeId() {
    return this.state.officeId;
  }

  get createdAt() {
    return this.state.createdAt;
  }

  get updatedAt() {
    return this.state.updatedAt;
  }

  static create(data: CreateClient) {
    return new this({
      id: data.id,
      name: data.name,
      officeId: data.office.id,
      createdAt: data.now,
      updatedAt: data.now,
    });
  }
}
