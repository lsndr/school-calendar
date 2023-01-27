import { Repository } from 'yuow';
import { Visit } from '../../domain';
import { VisitDataMapper } from './visit.datamapper';

export class VisitRepository extends Repository<Visit, VisitDataMapper> {
  protected mapperConstructor = VisitDataMapper;

  protected extractIdentity(visit: Visit) {
    return visit.id;
  }

  async findOne(...args: Parameters<VisitDataMapper['findOne']>) {
    const result = await this.mapper.findOne(...args);

    return this.trackAll(result, 'loaded');
  }
}
