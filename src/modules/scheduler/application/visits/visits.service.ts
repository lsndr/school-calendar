import { Injectable } from '@nestjs/common';
import {
  Client,
  Office,
  RequiredEmployees,
  TimeInterval,
  Visit,
  VisitId,
} from '../../domain';
import { CreateVisitDto } from './create-visit.dto';
import { DateTime } from 'luxon';
import { VisitDto } from './visit.dto';
import {
  mapDtoToRecurrence,
  mapRecurrenceToDto,
  mapRawRecurrenceToDto,
} from './mappers';
import { TimeIntervalDto } from './time-interval.dto';
import { MikroORM } from '@mikro-orm/postgresql';

@Injectable()
export class VisitsService {
  constructor(private readonly orm: MikroORM) {}

  async create(officeId: string, dto: CreateVisitDto) {
    const em = this.orm.em.fork();
    const clientRepository = em.getRepository(Client);
    const officeRepository = em.getRepository(Office);
    const visitRepository = em.getRepository(Visit);

    const [office, client] = await Promise.all([
      officeRepository
        .createQueryBuilder()
        .where({
          id: officeId,
        })
        .getSingleResult(),
      clientRepository
        .createQueryBuilder()
        .where({
          id: dto.clientId,
        })
        .getSingleResult(),
    ]);

    if (!office) {
      throw new Error('Office not found');
    }

    if (!client) {
      throw new Error('Client not found');
    }

    const id = VisitId.create();
    const name = dto.name;
    const requiredEmployees = RequiredEmployees.create(dto.requiredEmployees);
    const recurrence = mapDtoToRecurrence(dto.recurrence);
    const time = TimeInterval.create(dto.time);
    const now = DateTime.now();

    const visit = Visit.create({
      id,
      name,
      office,
      requiredEmployees,
      recurrence,
      time,
      client,
      now,
    });

    await visitRepository.persistAndFlush(visit);

    return new VisitDto({
      id: visit.id.value,
      name: visit.name,
      recurrence: mapRecurrenceToDto(visit.recurrence),
      time: new TimeIntervalDto(visit.time),
      clientId: visit.clientId.value,
      requiredEmployees: visit.requiredEmployees.value,
      createdAt: visit.createdAt.toISO(),
      updatedAt: visit.updatedAt.toISO(),
    });
  }

  async findOne(id: string) {
    const knex = this.orm.em.getConnection().getKnex();

    const record = await knex
      .select([
        'id',
        'name',
        'recurrence_type',
        'recurrence_days',
        'recurrence_week1',
        'recurrence_week2',
        'time_starts_at',
        'time_duration',
        'client_id',
        'required_employees',
        'created_at',
        'updated_at',
      ])
      .from('visit')
      .where('id', id)
      .first();

    if (!record) {
      return;
    }

    return new VisitDto({
      id: record.id,
      name: record.name,
      recurrence: mapRawRecurrenceToDto(record.recurrence_type, {
        days: record.recurrence_days,
        week1: record.recurrence_week1,
        week2: record.recurrence_week2,
      }),
      time: new TimeIntervalDto({
        startsAt: record.time_starts_at,
        duration: record.time_duration,
      }),
      clientId: record.client_id,
      requiredEmployees: record.required_employees,
      createdAt: record.created_at.toISO(),
      updatedAt: record.updated_at.toISO(),
    });
  }

  async findMany(officeId: string) {
    const knex = this.orm.em.getConnection().getKnex();

    const records = await knex
      .select([
        'id',
        'name',
        'recurrence_type',
        'recurrence_days',
        'recurrence_week1',
        'recurrence_week2',
        'time_starts_at',
        'time_duration',
        'client_id',
        'required_employees',
        'created_at',
        'updated_at',
      ])
      .from('visit')
      .where('office_id', officeId);

    const visits: VisitDto[] = [];

    for (const record of records) {
      visits.push(
        new VisitDto({
          id: record.id,
          name: record.name,
          recurrence: mapRawRecurrenceToDto(record.recurrence_type, {
            days: record.recurrence_days,
            week1: record.recurrence_week1,
            week2: record.recurrence_week2,
          }),
          time: new TimeIntervalDto({
            startsAt: record.time_starts_at,
            duration: record.time_duration,
          }),
          clientId: record.client_id,
          requiredEmployees: record.required_employees,
          createdAt: record.created_at.toISO(),
          updatedAt: record.updated_at.toISO(),
        }),
      );
    }

    return visits;
  }
}
