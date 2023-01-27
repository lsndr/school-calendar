import { Repository } from 'yuow';
import { Subject } from '../../domain';
import { SubjectDataMapper } from './subject.datamapper';

export class SubjectRepository extends Repository<Subject, SubjectDataMapper> {
  protected mapperConstructor = SubjectDataMapper;

  protected extractIdentity(subject: Subject) {
    return subject.id;
  }

  async findOne(...args: Parameters<SubjectDataMapper['findOne']>) {
    const result = await this.mapper.findOne(...args);

    return this.trackAll(result, 'loaded');
  }
}
