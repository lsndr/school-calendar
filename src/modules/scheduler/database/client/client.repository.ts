import { Repository } from 'yuow';
import { Client } from '../../domain';
import { ClientDataMapper } from './client.datamapper';

export class ClientRepository extends Repository<Client, ClientDataMapper> {
  protected mapperConstructor = ClientDataMapper;

  protected extractIdentity(client: Client) {
    return client.id;
  }

  async findOne(...args: Parameters<ClientDataMapper['findOne']>) {
    const result = await this.mapper.findOne(...args);

    return this.trackAll(result, 'loaded');
  }
}
