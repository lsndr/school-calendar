import { Group, GroupState } from '../../domain';

export class GroupHydrator extends Group {
  constructor(state: GroupState) {
    super(state);
  }
}
