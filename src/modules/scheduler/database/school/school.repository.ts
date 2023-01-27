import { Repository } from 'yuow';
import { School } from '../../domain';
import { SchoolDataMapper } from './school.datamapper';

export class SchoolRepository extends Repository<School, SchoolDataMapper> {
  protected mapperConstructor = SchoolDataMapper;

  protected extractIdentity(school: School) {
    return school.id;
  }

  async findOne(...args: Parameters<SchoolDataMapper['findOne']>) {
    const result = await this.mapper.findOne(...args);

    return this.trackAll(result, 'loaded');
  }
}
