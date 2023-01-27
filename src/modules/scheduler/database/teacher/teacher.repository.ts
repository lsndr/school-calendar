import { Repository } from 'yuow';
import { Teacher } from '../../domain';
import { TeacherDataMapper } from './teacher.datamapper';

export class TeacherRepository extends Repository<Teacher, TeacherDataMapper> {
  protected mapperConstructor = TeacherDataMapper;

  protected extractIdentity(teacher: Teacher) {
    return teacher.id;
  }

  async findOne(...args: Parameters<TeacherDataMapper['findOne']>) {
    const result = await this.mapper.findOne(...args);

    return this.trackAll(result, 'loaded');
  }

  async findMany(...args: Parameters<TeacherDataMapper['findMany']>) {
    const result = await this.mapper.findMany(...args);

    return this.trackAll(result, 'loaded');
  }
}
