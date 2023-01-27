import { Repository } from 'yuow';
import { Office } from '../../domain';
import { OfficeDataMapper } from './office.datamapper';

export class OfficeRepository extends Repository<Office, OfficeDataMapper> {
  protected mapperConstructor = OfficeDataMapper;

  protected extractIdentity(office: Office) {
    return office.id;
  }

  async findOne(...args: Parameters<OfficeDataMapper['findOne']>) {
    const result = await this.mapper.findOne(...args);

    return this.trackAll(result, 'loaded');
  }
}
