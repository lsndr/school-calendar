import { DataMapper } from 'yuow';
import { Visit } from '../../domain';
import { ClientIdHydrator } from '../client';
import { OfficeIdHydrator } from '../office';
import { mapPeriodicityToRaw, mapRawToPeriodicity } from './mapers';
import { RequiredEmployeesHydrator } from './required-employees.hydrator';
import { TimeIntervalHydartor } from './time-interval.hydrator';
import { VisitIdHydrator } from './visit-id.hydrator';
import { VisitHydrator } from './visit.hydrator';

export interface FindOneVisitQuery {
  id?: string;
  officeId?: string;
}

export class VisitDataMapper extends DataMapper<Visit> {
  async findOne(query: FindOneVisitQuery): Promise<Visit | undefined> {
    const queryBuilder = this.knex
      .select([
        'id',
        'name',
        'office_id',
        'periodicity_type',
        'periodicity_data',
        'starts_at',
        'duration',
        'client_id',
        'required_employees',
        'version',
        'updated_at',
        'created_at',
      ])
      .from('visits');

    if (typeof query.id !== 'undefined') {
      queryBuilder.where('id', query.id);
    }

    if (typeof query.officeId !== 'undefined') {
      queryBuilder.where('office_id', query.officeId);
    }

    const record = await queryBuilder.first();

    if (!record) {
      return;
    }

    const visit = this.map(record);

    this.setVersion(visit, record.version);

    return visit;
  }

  async insert(visit: Visit): Promise<boolean> {
    return this.upsert(visit);
  }

  async update(visit: Visit): Promise<boolean> {
    return this.upsert(visit);
  }

  private async upsert(visit: Visit): Promise<boolean> {
    const version = this.increaseVersion(visit);

    const [result] = await Promise.all<any[]>([
      this.knex
        .insert({
          id: visit.id.value,
          name: visit.name,
          office_id: visit.officeId.value,
          periodicity_type: visit.periodicity.type,
          periodicity_data: mapPeriodicityToRaw(visit.periodicity),
          starts_at: visit.timeInterval.startsAt,
          duration: visit.timeInterval.duration,
          client_id: visit.clientId.value,
          required_employees: visit.requiredEmployees.amount,
          created_at: visit.createdAt.toJSDate(),
          updated_at: visit.updatedAt.toJSDate(),
          version,
        })
        .into('visits')
        .onConflict('id')
        .merge()
        .where('visits.id', visit.id.value)
        .andWhere('visits.version', version - 1),
      this.knex
        .insert({
          visit_id: visit.id.value,
          name: visit.name,
          periodicity_type: visit.periodicity.type,
          periodicity_data: visit.periodicity,
          starts_at: visit.timeInterval.startsAt,
          duration: visit.timeInterval.duration,
          required_employees: visit.requiredEmployees.amount,
          created_at: visit.updatedAt.toJSDate(),
        })
        .into('visits_log'),
    ]);

    return result.rowCount > 0;
  }

  async delete(visit: Visit): Promise<boolean> {
    const version = this.getVersion(visit);

    const result: any = await this.knex
      .delete()
      .from('visits')
      .where('visits.id', visit.id.value)
      .andWhere('visits.version', version);

    return result.rowCount > 0;
  }

  private map(record: any) {
    const id = new VisitIdHydrator(record.id);
    const officeId = new OfficeIdHydrator(record.office_id);
    const name = record.name;
    const periodicity = mapRawToPeriodicity(
      record.periodicity_type,
      record.periodicity_data,
    );
    const timeInterval = new TimeIntervalHydartor({
      startsAt: record.starts_at,
      duration: record.duration,
    });
    const clientId = new ClientIdHydrator(record.client_id);
    const requiredEmployees = new RequiredEmployeesHydrator(
      record.required_employees,
    );
    const createdAt = record.created_at;
    const updatedAt = record.updated_at;

    return new VisitHydrator({
      id,
      officeId,
      name,
      periodicity,
      timeInterval,
      clientId,
      requiredEmployees,
      createdAt,
      updatedAt,
    });
  }
}
