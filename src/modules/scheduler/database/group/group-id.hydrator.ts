import { GroupId } from '../../domain';

export class GroupIdHydrator extends GroupId {
  constructor(id: string) {
    super(id);
  }
}
