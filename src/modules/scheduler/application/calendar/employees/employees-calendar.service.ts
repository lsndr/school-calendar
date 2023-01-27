import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { KNEX_PROVIDER } from '../../../../shared/database';
import { EmployeesCalendarDto } from './employees-calendar.dto';
import { EmployeesCalendarLoader } from './employees-calendar.loader';
import { EmployeesCalendarQueryDto } from './employees-calendar.query.dto';

@Injectable()
export class EmployeesCalendarService {
  constructor(
    @Inject(KNEX_PROVIDER)
    private readonly knex: Knex,
    private readonly loader: EmployeesCalendarLoader,
  ) {}

  async getForPeriod(
    officeId: string,
    query: EmployeesCalendarQueryDto,
  ): Promise<EmployeesCalendarDto> {
    const office = await this.knex
      .select(['id', 'time_zone'])
      .from('offices')
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
