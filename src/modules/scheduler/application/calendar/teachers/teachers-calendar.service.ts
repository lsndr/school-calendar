import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { KNEX_PROVIDER } from '../../../../shared/database';
import { TeachersCalendarDto } from './teachers-calendar.dto';
import { TeachersCalendarLoader } from './teachers-calendar.loader';
import { TeachersCalendarQueryDto } from './teachers-calendar.query.dto';

@Injectable()
export class TeachersCalendarService {
  constructor(
    @Inject(KNEX_PROVIDER)
    private readonly knex: Knex,
    private readonly loader: TeachersCalendarLoader,
  ) {}

  async getForPeriod(
    schoolId: string,
    query: TeachersCalendarQueryDto,
  ): Promise<TeachersCalendarDto> {
    const school = await this.knex
      .select(['id', 'time_zone'])
      .from('schools')
      .where('id', schoolId)
      .first();

    if (!school) {
      throw new Error('School not found');
    }

    const from = DateTime.fromISO(query.dateFrom, {
      zone: school.time_zone,
    }).startOf('day');

    const to = DateTime.fromISO(query.dateFrom, {
      zone: school.time_zone,
    })
      .startOf('day')
      .plus({ day: 1 });

    const diff = from.diff(to, ['days']).days;

    if (diff > 7 || diff <= 0) {
      return {
        teachers: [],
        events: [],
      };
    }

    return this.loader.forPeriod({
      schoolId: school.id,
      from,
      to,
      timeZone: school.timeZone,
    });
  }
}
