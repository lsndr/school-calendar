import { Type } from '@mikro-orm/core';
import { GroupId } from '../domain/group/group-id';

export class GroupIdType extends Type<GroupId, string> {
  public override convertToDatabaseValue(value: GroupId | string): string {
    if (value instanceof GroupId) {
      return value.value;
    }

    return value;
  }

  public override convertToJSValue(value: string | GroupId): GroupId {
    if (typeof value === 'string') {
      const id = Object.create(GroupId.prototype) as GroupId;

      return Object.assign(id, {
        value,
      });
    }

    return value;
  }

  public override compareAsType(): string {
    return 'string';
  }
}
