import { Injectable } from '@nestjs/common';
import { School, SchoolId, TimeZone } from '../../domain';
import { CreateSchoolDto } from './create-school.dto';
import { SchoolDto } from './school.dto';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';

@Injectable()
export class SchoolsService {
  constructor(private readonly orm: MikroORM) {}

  async create(dto: CreateSchoolDto) {
    const em = this.orm.em.fork();
    const schoolRepository = em.getRepository(School);

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

    await schoolRepository.persistAndFlush(school);

    return new SchoolDto({
      id: school.id.value,
      name: school.name,
      timeZone: school.timeZone.value,
    });
  }

  async findOne(id: string) {
    const knex = this.orm.em.getConnection().getKnex();

    const record = await knex
      .select(['id', 'time_zone', 'name'])
      .from('school')
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

  async findMany() {
    const knex = this.orm.em.getConnection().getKnex();

    const records = await knex
      .select(['id', 'time_zone', 'name'])
      .from('school');

    const schools: SchoolDto[] = [];

    for (const record of records) {
      schools.push(
        new SchoolDto({
          id: record.id,
          name: record.name,
          timeZone: record.time_zone,
        }),
      );
    }

    return schools;
  }
}
