import { Inject, Injectable } from '@nestjs/common';
import { KNEX_PROVIDER, UOW_PROVIDER } from '../../../shared/database';
import { Uow } from 'yuow';
import { SchoolRepository } from '../../database';
import { School, SchoolId, TimeZone } from '../../domain';
import { Knex } from 'knex';
import { CreateSchoolDto } from './create-school.dto';
import { SchoolDto } from './school.dto';
import { DateTime } from 'luxon';

@Injectable()
export class SchoolsService {
  constructor(
    @Inject(UOW_PROVIDER) private readonly uow: Uow,
    @Inject(KNEX_PROVIDER) private readonly knex: Knex,
  ) {}

  create(dto: CreateSchoolDto) {
    return this.uow((ctx) => {
      const id = SchoolId.create();
      const name = dto.name;
      const timeZone = TimeZone.create(dto.timeZone);
      const now = DateTime.now();

      const school = School.create({
        id,
        name,
        timeZone,
        now,
      });

      const schoolRepository = ctx.getRepository(SchoolRepository);
      schoolRepository.add(school);

      return new SchoolDto({
        id: school.id.value,
        name: school.name,
        timeZone: school.timeZone.value,
      });
    });
  }

  async findOne(id: string) {
    const record = await this.knex
      .select(['id', 'time_zone', 'name'])
      .from('schools')
      .where('id', id)
      .first();

    if (!record) {
      return;
    }

    return new SchoolDto({
      id: record.id,
      name: record.name,
      timeZone: record.time_zone,
    });
  }
}
