import { Inject, Injectable } from '@nestjs/common';
import { KNEX_PROVIDER, UOW_PROVIDER } from '../../../shared/database';
import { Uow } from 'yuow';
import { OfficeRepository } from '../../database';
import { Office, OfficeId, TimeZone } from '../../domain';
import { Knex } from 'knex';
import { CreateOfficeDto } from './create-office.dto';
import { OfficeDto } from './office.dto';
import { DateTime } from 'luxon';

@Injectable()
export class OfficesService {
  constructor(
    @Inject(UOW_PROVIDER) private readonly uow: Uow,
    @Inject(KNEX_PROVIDER) private readonly knex: Knex,
  ) {}

  create(dto: CreateOfficeDto) {
    return this.uow((ctx) => {
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

      const officeRepository = ctx.getRepository(OfficeRepository);
      officeRepository.add(office);

      return new OfficeDto({
        id: office.id.value,
        name: office.name,
        timeZone: office.timeZone.value,
      });
    });
  }

  async findOne(id: string) {
    const record = await this.knex
      .select(['id', 'time_zone', 'name'])
      .from('offices')
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
