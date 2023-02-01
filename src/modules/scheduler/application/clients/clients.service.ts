import { Inject, Injectable } from '@nestjs/common';
import { MIKROORM_PROVIDER } from '../../../shared/database';
import { Client, ClientId, Office } from '../../domain';
import { CreateClientDto } from './create-client.dto';
import { ClientDto } from './client.dto';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';

@Injectable()
export class ClientsService {
  constructor(@Inject(MIKROORM_PROVIDER) private readonly orm: MikroORM) {}

  async create(dto: CreateClientDto) {
    const em = this.orm.em.fork();
    const officeRepository = em.getRepository(Office);
    const clientRepository = em.getRepository(Client);

    const office = await officeRepository
      .createQueryBuilder()
      .where({
        id: dto.officeId,
      })
      .getSingleResult();

    if (!office) {
      throw new Error('Office not found');
    }

    const id = ClientId.create();
    const name = dto.name;
    const now = DateTime.now();

    const client = Client.create({
      id,
      name,
      office: office,
      now,
    });

    await clientRepository.persistAndFlush(client);

    return new ClientDto({
      id: client.id.value,
      name: client.name,
    });
  }

  async findOne(id: string) {
    const knex = this.orm.em.getConnection().getKnex();

    const record = await knex
      .select(['id', 'name'])
      .from('client')
      .where('id', id)
      .first();

    if (!record) {
      return;
    }

    return new ClientDto({
      id: record.id,
      name: record.name,
    });
  }
}
