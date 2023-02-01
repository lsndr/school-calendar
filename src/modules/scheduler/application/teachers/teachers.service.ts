import { Injectable } from '@nestjs/common';
import { Teacher, TeacherId, School } from '../../domain';
import { CreateTeacherDto } from './create-teacher.dto';
import { TeacherDto } from './teacher.dto';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';

@Injectable()
export class TeachersService {
  constructor(private readonly orm: MikroORM) {}

  async create(dto: CreateTeacherDto) {
    const em = this.orm.em.fork();
    const schoolRepository = em.getRepository(School);
    const teacherRepository = em.getRepository(Teacher);

    const school = await schoolRepository
      .createQueryBuilder()
      .where({
        id: dto.schoolId,
      })
      .getSingleResult();

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

    await teacherRepository.persistAndFlush(teacher);

    return new TeacherDto({
      id: teacher.id.value,
      name: teacher.name,
    });
  }

  async findOne(id: string) {
    const knex = this.orm.em.getConnection().getKnex();

    const record = await knex
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
