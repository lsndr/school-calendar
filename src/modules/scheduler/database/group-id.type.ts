import { Type } from '@mikro-orm/core';
import { GroupId } from '../domain/group/group-id';

export class GroupIdType extends Type<GroupId, string> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof GroupId) {
      return value.value;
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (typeof value === 'string') {
      const id = Object.create(GroupId.prototype);

      return Object.assign(id, {
        value,
      });
    }

    return value;
  }

  override compareAsType() {
    return 'string';
  }
}
