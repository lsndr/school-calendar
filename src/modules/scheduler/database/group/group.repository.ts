import { Repository } from 'yuow';
import { Group } from '../../domain';
import { GroupDataMapper } from './group.datamapper';

export class GroupRepository extends Repository<Group, GroupDataMapper> {
  protected mapperConstructor = GroupDataMapper;

  protected extractIdentity(group: Group) {
    return group.id;
  }

  async findOne(...args: Parameters<GroupDataMapper['findOne']>) {
    const result = await this.mapper.findOne(...args);

    return this.trackAll(result, 'loaded');
  }
}
