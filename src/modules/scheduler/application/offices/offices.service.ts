import { Inject, Injectable } from '@nestjs/common';
import { MIKROORM_PROVIDER } from '../../../shared/database';
import { Office, OfficeId, TimeZone } from '../../domain';
import { CreateOfficeDto } from './create-office.dto';
import { OfficeDto } from './office.dto';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';

@Injectable()
export class OfficesService {
  constructor(@Inject(MIKROORM_PROVIDER) private readonly orm: MikroORM) {}

  async create(dto: CreateOfficeDto) {
    const em = this.orm.em.fork();
    const officeRepository = em.getRepository(Office);

    const id = OfficeId.create();
    const name = dto.name;
    const timeZone = TimeZone.create(dto.timeZone);
    const now = DateTime.now();

    const office = Office.create({
      id,
      name,
      timeZone,
      now,
    });

    await officeRepository.persistAndFlush(office);

    return new OfficeDto({
      id: office.id.value,
      name: office.name,
      timeZone: office.timeZone.value,
    });
  }

  async findOne(id: string) {
    const knex = this.orm.em.getConnection().getKnex();

    const record = await knex
      .select(['id', 'time_zone', 'name'])
      .from('office')
      .where('id', id)
      .first();

    if (!record) {
      return;
    }

    return new OfficeDto({
      id: record.id,
      name: record.name,
      timeZone: record.time_zone,
    });
  }
}
