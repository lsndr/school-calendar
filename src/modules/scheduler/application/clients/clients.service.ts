import { Inject, Injectable } from '@nestjs/common';
import { KNEX_PROVIDER, UOW_PROVIDER } from '../../../shared/database';
import { Uow } from 'yuow';
import { ClientRepository, OfficeRepository } from '../../database';
import { Client, ClientId } from '../../domain';
import { Knex } from 'knex';
import { CreateClientDto } from './create-client.dto';
import { ClientDto } from './client.dto';
import { DateTime } from 'luxon';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(UOW_PROVIDER) private readonly uow: Uow,
    @Inject(KNEX_PROVIDER) private readonly knex: Knex,
  ) {}

  create(dto: CreateClientDto) {
    return this.uow(async (ctx) => {
      const officeRepository = ctx.getRepository(OfficeRepository);
      const office = await officeRepository.findOne({
        id: dto.officeId,
      });

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

      const clientRepository = ctx.getRepository(ClientRepository);
      clientRepository.add(client);

      return new ClientDto({
        id: client.id.value,
        name: client.name,
      });
    });
  }

  async findOne(id: string) {
    const record = await this.knex
      .select(['id', 'name'])
      .from('clients')
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
