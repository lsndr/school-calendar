import { Inject, Injectable } from '@nestjs/common';
import { KNEX_PROVIDER, UOW_PROVIDER } from '../../../shared/database';
import { Uow } from 'yuow';
import { TeacherRepository, SchoolRepository } from '../../database';
import { Teacher, TeacherId } from '../../domain';
import { Knex } from 'knex';
import { CreateTeacherDto } from './create-teacher.dto';
import { TeacherDto } from './teacher.dto';
import { DateTime } from 'luxon';

@Injectable()
export class TeachersService {
  constructor(
    @Inject(UOW_PROVIDER) private readonly uow: Uow,
    @Inject(KNEX_PROVIDER) private readonly knex: Knex,
  ) {}

  create(dto: CreateTeacherDto) {
    return this.uow(async (ctx) => {
      const schoolRepository = ctx.getRepository(SchoolRepository);
      const school = await schoolRepository.findOne({
        id: dto.schoolId,
      });

      if (!school) {
        throw new Error('School not found');
      }

      const id = TeacherId.create();
      const name = dto.name;

      const teacher = Teacher.create({
        id,
        name,
        school: school,
        now: DateTime.now(),
      });

      const teacherRepository = ctx.getRepository(TeacherRepository);
      teacherRepository.add(teacher);

      return new TeacherDto({
        id: teacher.id.value,
        name: teacher.name,
      });
    });
  }

  async findOne(id: string) {
    const record = await this.knex
      .select(['id', 'name'])
      .from('teachers')
      .where('id', id)
      .first();

    if (!record) {
      return;
    }

    return new TeacherDto({
      id: record.id,
      name: record.name,
    });
  }
}
