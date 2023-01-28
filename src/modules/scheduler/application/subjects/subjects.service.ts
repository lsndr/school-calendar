import { Inject, Injectable } from '@nestjs/common';
import { KNEX_PROVIDER, UOW_PROVIDER } from '../../../shared/database';
import { Uow } from 'yuow';
import { GroupRepository, SchoolRepository } from '../../database';
import {
  RequiredTeachers,
  TimeInterval,
  Subject,
  SubjectId,
} from '../../domain';
import { Knex } from 'knex';
import { CreateSubjectDto } from './create-subject.dto';
import { DateTime } from 'luxon';
import { SubjectRepository } from '../../database/subject';
import { SubjectDto } from './subject.dto';
import {
  mapDtoToPeriodicity,
  mapPeriodicityToDto,
  mapRawPeriodicityToDto,
} from './mappers';
import { TimeIntervalDto } from './time-interval.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @Inject(UOW_PROVIDER) private readonly uow: Uow,
    @Inject(KNEX_PROVIDER) private readonly knex: Knex,
  ) {}

  create(schoolId: string, dto: CreateSubjectDto) {
    return this.uow(async (ctx) => {
      const groupRepository = ctx.getRepository(GroupRepository);
      const schoolRepository = ctx.getRepository(SchoolRepository);

      const [school, group] = await Promise.all([
        schoolRepository.findOne({
          id: schoolId,
        }),

        groupRepository.findOne({
          id: dto.groupId,
        }),
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
      const periodicity = mapDtoToPeriodicity(dto.periodicity);
      const time = TimeInterval.create(dto.time);
      const now = DateTime.now();

      const subject = Subject.create({
        id,
        name,
        school,
        requiredTeachers,
        periodicity,
        time,
        group,
        now,
      });

      const subjectRepository = ctx.getRepository(SubjectRepository);
      subjectRepository.add(subject);

      return new SubjectDto({
        id: subject.id.value,
        name: subject.name,
        periodicity: mapPeriodicityToDto(subject.periodicity),
        time: new TimeIntervalDto(subject.time),
        groupId: subject.groupId.value,
        requiredTeachers: subject.requiredTeachers.amount,
        createdAt: subject.createdAt.toISO(),
        updatedAt: subject.updatedAt.toISO(),
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
        'group_id',
        'required_teachers',
        'created_at',
        'updated_at',
      ])
      .from('subjects')
      .where('id', id)
      .first();

    if (!record) {
      return;
    }

    return new SubjectDto({
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
      groupId: record.group_id,
      requiredTeachers: record.required_teachers,
      createdAt: record.created_at.toISO(),
      updatedAt: record.updated_at.toISO(),
    });
  }
}
