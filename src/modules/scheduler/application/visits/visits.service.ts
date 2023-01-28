import { Inject, Injectable } from '@nestjs/common';
import { KNEX_PROVIDER, UOW_PROVIDER } from '../../../shared/database';
import { Uow } from 'yuow';
import { ClientRepository, OfficeRepository } from '../../database';
import { RequiredEmployees, TimeInterval, Visit, VisitId } from '../../domain';
import { Knex } from 'knex';
import { CreateVisitDto } from './create-visit.dto';
import { DateTime } from 'luxon';
import { VisitRepository } from '../../database/visit';
import { VisitDto } from './visit.dto';
import {
  mapDtoToPeriodicity,
  mapPeriodicityToDto,
  mapRawPeriodicityToDto,
} from './mappers';
import { TimeIntervalDto } from './time-interval.dto';

@Injectable()
export class VisitsService {
  constructor(
    @Inject(UOW_PROVIDER) private readonly uow: Uow,
    @Inject(KNEX_PROVIDER) private readonly knex: Knex,
  ) {}

  create(officeId: string, dto: CreateVisitDto) {
    return this.uow(async (ctx) => {
      const clientRepository = ctx.getRepository(ClientRepository);
      const officeRepository = ctx.getRepository(OfficeRepository);

      const [office, client] = await Promise.all([
        officeRepository.findOne({
          id: officeId,
        }),

        clientRepository.findOne({
          id: dto.clientId,
        }),
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
      const periodicity = mapDtoToPeriodicity(dto.periodicity);
      const time = TimeInterval.create(dto.time);
      const now = DateTime.now();

      const visit = Visit.create({
        id,
        name,
        office,
        requiredEmployees,
        periodicity,
        time,
        client,
        now,
      });

      const visitRepository = ctx.getRepository(VisitRepository);
      visitRepository.add(visit);

      return new VisitDto({
        id: visit.id.value,
        name: visit.name,
        periodicity: mapPeriodicityToDto(visit.periodicity),
        time: new TimeIntervalDto(visit.time),
        clientId: visit.clientId.value,
        requiredEmployees: visit.requiredEmployees.amount,
        createdAt: visit.createdAt.toISO(),
        updatedAt: visit.updatedAt.toISO(),
      });
    });
  }

  async findOne(id: string) {
    const record = await this.knex
      .select([
        'id',
        'name',
        'periodicity_type',
        'periodicity_data',
        'time_starts_at',
        'time_duration',
        'client_id',
        'required_employees',
        'created_at',
        'updated_at',
      ])
      .from('visits')
      .where('id', id)
      .first();

    if (!record) {
      return;
    }

    return new VisitDto({
      id: record.id,
      name: record.name,
      periodicity: mapRawPeriodicityToDto(
        record.periodicity_type,
        record.periodicity_data,
      ),
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
}
