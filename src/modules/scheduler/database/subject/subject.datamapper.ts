import { DataMapper } from 'yuow';
import { Subject } from '../../domain';
import { GroupIdHydrator } from '../group';
import { SchoolIdHydrator } from '../school';
import { mapPeriodicityToRaw, mapRawToPeriodicity } from './mapers';
import { RequiredTeachersHydrator } from './required-teachers.hydrator';
import { TimeIntervalHydartor } from './time-interval.hydrator';
import { SubjectIdHydrator } from './subject-id.hydrator';
import { SubjectHydrator } from './subject.hydrator';

export interface FindOneSubjectQuery {
  id?: string;
  schoolId?: string;
}

export class SubjectDataMapper extends DataMapper<Subject> {
  async findOne(query: FindOneSubjectQuery): Promise<Subject | undefined> {
    const queryBuilder = this.knex
      .select([
        'id',
        'name',
        'school_id',
        'periodicity_type',
        'periodicity_data',
        'starts_at',
        'duration',
        'group_id',
        'required_teachers',
        'version',
        'updated_at',
        'created_at',
      ])
      .from('subjects');

    if (typeof query.id !== 'undefined') {
      queryBuilder.where('id', query.id);
    }

    if (typeof query.schoolId !== 'undefined') {
      queryBuilder.where('school_id', query.schoolId);
    }

    const record = await queryBuilder.first();

    if (!record) {
      return;
    }

    const subject = this.map(record);

    this.setVersion(subject, record.version);

    return subject;
  }

  async insert(subject: Subject): Promise<boolean> {
    return this.upsert(subject);
  }

  async update(subject: Subject): Promise<boolean> {
    return this.upsert(subject);
  }

  private async upsert(subject: Subject): Promise<boolean> {
    const version = this.increaseVersion(subject);

    const [result] = await Promise.all<any[]>([
      this.knex
        .insert({
          id: subject.id.value,
          name: subject.name,
          school_id: subject.schoolId.value,
          periodicity_type: subject.periodicity.type,
          periodicity_data: mapPeriodicityToRaw(subject.periodicity),
          starts_at: subject.timeInterval.startsAt,
          duration: subject.timeInterval.duration,
          group_id: subject.groupId.value,
          required_teachers: subject.requiredTeachers.amount,
          created_at: subject.createdAt.toJSDate(),
          updated_at: subject.updatedAt.toJSDate(),
          version,
        })
        .into('subjects')
        .onConflict('id')
        .merge()
        .where('subjects.id', subject.id.value)
        .andWhere('subjects.version', version - 1),
      this.knex
        .insert({
          subject_id: subject.id.value,
          name: subject.name,
          periodicity_type: subject.periodicity.type,
          periodicity_data: subject.periodicity,
          starts_at: subject.timeInterval.startsAt,
          duration: subject.timeInterval.duration,
          required_teachers: subject.requiredTeachers.amount,
          created_at: subject.updatedAt.toJSDate(),
        })
        .into('subjects_log'),
    ]);

    return result.rowCount > 0;
  }

  async delete(subject: Subject): Promise<boolean> {
    const version = this.getVersion(subject);

    const result: any = await this.knex
      .delete()
      .from('subjects')
      .where('subjects.id', subject.id.value)
      .andWhere('subjects.version', version);

    return result.rowCount > 0;
  }

  private map(record: any) {
    const id = new SubjectIdHydrator(record.id);
    const schoolId = new SchoolIdHydrator(record.school_id);
    const name = record.name;
    const periodicity = mapRawToPeriodicity(
      record.periodicity_type,
      record.periodicity_data,
    );
    const timeInterval = new TimeIntervalHydartor({
      startsAt: record.starts_at,
      duration: record.duration,
    });
    const groupId = new GroupIdHydrator(record.group_id);
    const requiredTeachers = new RequiredTeachersHydrator(
      record.required_teachers,
    );
    const createdAt = record.created_at;
    const updatedAt = record.updated_at;

    return new SubjectHydrator({
      id,
      schoolId,
      name,
      periodicity,
      timeInterval,
      groupId,
      requiredTeachers,
      createdAt,
      updatedAt,
    });
  }
}
