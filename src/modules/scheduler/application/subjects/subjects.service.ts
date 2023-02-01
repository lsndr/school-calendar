import { Injectable } from '@nestjs/common';
import {
  Group,
  School,
  RequiredTeachers,
  TimeInterval,
  Subject,
  SubjectId,
} from '../../domain';
import { CreateSubjectDto } from './create-subject.dto';
import { DateTime } from 'luxon';
import { SubjectDto } from './subject.dto';
import {
  mapDtoToRecurrence,
  mapRecurrenceToDto,
  mapRawRecurrenceToDto,
} from './mappers';
import { TimeIntervalDto } from './time-interval.dto';
import { MikroORM } from '@mikro-orm/postgresql';

@Injectable()
export class SubjectsService {
  constructor(private readonly orm: MikroORM) {}

  async create(schoolId: string, dto: CreateSubjectDto) {
    const em = this.orm.em.fork();
    const groupRepository = em.getRepository(Group);
    const schoolRepository = em.getRepository(School);
    const subjectRepository = em.getRepository(Subject);

    const [school, group] = await Promise.all([
      schoolRepository
        .createQueryBuilder()
        .where({
          id: schoolId,
        })
        .getSingleResult(),

      groupRepository
        .createQueryBuilder()
        .where({
          id: dto.groupId,
        })
        .getSingleResult(),
    ]);

    if (!school) {
      throw new Error('School not found');
    }

    if (!group) {
      throw new Error('Group not found');
    }

    const id = SubjectId.create();
    const name = dto.name;
    const requiredTeachers = RequiredTeachers.create(dto.requiredTeachers);
    const recurrence = mapDtoToRecurrence(dto.recurrence);
    const time = TimeInterval.create(dto.time);
    const now = DateTime.now();

    const subject = Subject.create({
      id,
      name,
      school,
      requiredTeachers,
      recurrence,
      time,
      group,
      now,
    });

    await subjectRepository.persistAndFlush(subject);

    return new SubjectDto({
      id: subject.id.value,
      name: subject.name,
      recurrence: mapRecurrenceToDto(subject.recurrence),
      time: new TimeIntervalDto(subject.time),
      groupId: subject.groupId.value,
      requiredTeachers: subject.requiredTeachers.value,
      createdAt: subject.createdAt.toISO(),
      updatedAt: subject.updatedAt.toISO(),
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
        'group_id',
        'required_teachers',
        'created_at',
        'updated_at',
      ])
      .from('subject')
      .where('id', id)
      .first();

    if (!record) {
      return;
    }

    return new SubjectDto({
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
      groupId: record.group_id,
      requiredTeachers: record.required_teachers,
      createdAt: record.created_at.toISO(),
      updatedAt: record.updated_at.toISO(),
    });
  }
}
