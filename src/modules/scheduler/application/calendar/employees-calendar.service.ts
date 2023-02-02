import { MikroORM } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { EmployeesCalendarDto } from './employees-calendar.dto';
import { EmployeesCalendarLoader } from './employees-calendar.loader';
import { EmployeesCalendarQueryDto } from './employees-calendar.query.dto';

@Injectable()
export class EmployeesCalendarService {
  constructor(
    private readonly loader: EmployeesCalendarLoader,
    private readonly orm: MikroORM,
  ) {}

  async getForPeriod(
    officeId: string,
    query: EmployeesCalendarQueryDto,
  ): Promise<EmployeesCalendarDto> {
    const knex = this.orm.em.getConnection().getKnex();

    const office = await knex
      .select(['id', 'time_zone'])
      .from('office')
      .where('id', officeId)
      .first();

    if (!office) {
      throw new Error('Office not found');
    }

    const from = DateTime.fromISO(query.startDate, {
      zone: office.time_zone,
    }).startOf('day');

    const to = from.plus({ day: query.days });

    return this.loader.forPeriod({
      officeId: office.id,
      from,
      to,
      timeZone: office.timeZone,
    });
  }
}
