import { MikroORM } from '@mikro-orm/postgresql';
import { Inject, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { MIKROORM_PROVIDER } from '../../../../shared/database';
import { EmployeesCalendarDto } from './employees-calendar.dto';
import { EmployeesCalendarLoader } from './employees-calendar.loader';
import { EmployeesCalendarQueryDto } from './employees-calendar.query.dto';

@Injectable()
export class EmployeesCalendarService {
  constructor(
    private readonly loader: EmployeesCalendarLoader,
    @Inject(MIKROORM_PROVIDER)
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

    const from = DateTime.fromISO(query.dateFrom, {
      zone: office.time_zone,
    }).startOf('day');

    const to = DateTime.fromISO(query.dateFrom, {
      zone: office.time_zone,
    })
      .startOf('day')
      .plus({ day: 1 });

    const diff = from.diff(to, ['days']).days;

    if (diff > 7 || diff <= 0) {
      return {
        employees: [],
        events: [],
      };
    }

    return this.loader.forPeriod({
      officeId: office.id,
      from,
      to,
      timeZone: office.timeZone,
    });
  }
}
