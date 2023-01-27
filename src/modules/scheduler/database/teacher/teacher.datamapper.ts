import { DataMapper } from 'yuow';
import { Teacher } from '../../domain';
import { SchoolIdHydrator } from '../school';
import { TeacherIdHydrator } from './teacher-id.hydrator';
import { TeacherHydrator } from './teacher.hydrator';

export interface FindOneTeacherQuery {
  id?: string;
}

export interface FindManyTeachersQuery {
  ids?: string[];
  schoolId?: string;
}

export class TeacherDataMapper extends DataMapper<Teacher> {
  async findOne(query: FindOneTeacherQuery): Promise<Teacher | undefined> {
    const ids: string[] = [];

    if (typeof query.id !== 'undefined') {
      ids.push(query.id);
    }

    const teachers = await this.findMany({
      ids,
    });

    return teachers[0];
  }

  async findMany(query: FindManyTeachersQuery): Promise<Teacher[]> {
    const queryBuilder = this.knex
      .select([
        'id',
        'name',
        'school_id',
        'version',
        'updated_at',
        'created_at',
      ])
      .from('teachers');

    if (typeof query.ids !== 'undefined') {
      if (query.ids.length > 0) {
        queryBuilder.whereIn('id', query.ids);
      } else {
        return [];
      }
    }

    if (typeof query.schoolId !== 'undefined') {
      queryBuilder.where('school_id', query.schoolId);
    }

    const records = await queryBuilder;

    const teachers: Teacher[] = [];

    for (const record of records) {
      const teacher = this.map(record);
      this.setVersion(teacher, record.version);

      teachers.push(teacher);
    }

    return teachers;
  }

  async insert(teacher: Teacher): Promise<boolean> {
    return this.upsert(teacher);
  }

  async update(teacher: Teacher): Promise<boolean> {
    return this.upsert(teacher);
  }

  private async upsert(teacher: Teacher): Promise<boolean> {
    const version = this.increaseVersion(teacher);

    const result: any = await this.knex
      .insert({
        id: teacher.id.value,
        name: teacher.name,
        school_id: teacher.schoolId.value,
        version,
        created_at: teacher.createdAt.toJSDate(),
        updated_at: teacher.updatedAt.toJSDate(),
      })
      .into('teachers')
      .onConflict('id')
      .merge()
      .where('teachers.id', teacher.id.value)
      .andWhere('teachers.version', version - 1);

    return result.rowCount > 0;
  }

  async delete(teacher: Teacher): Promise<boolean> {
    const version = this.getVersion(teacher);

    const result: any = await this.knex
      .delete()
      .from('teachers')
      .where('teachers.id', teacher.id.value)
      .andWhere('teachers.version', version);

    return result.rowCount > 0;
  }

  private map(record: any) {
    const id = new TeacherIdHydrator(record.id);
    const schoolId = new SchoolIdHydrator(record.school_id);
    const createdAt = record.created_at;
    const updatedAt = record.updated_at;

    return new TeacherHydrator({
      id,
      name: record.name,
      schoolId,
      createdAt,
      updatedAt,
    });
  }
}
