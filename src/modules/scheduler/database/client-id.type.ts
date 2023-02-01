import { Type } from '@mikro-orm/core';
import { ClientId } from '../domain/client/client-id';

export class ClientIdType extends Type<ClientId, string> {
  override convertToDatabaseValue(value: any) {
    if (value instanceof ClientId) {
      return value.value;
    }

    return value;
  }

  override convertToJSValue(value: any) {
    if (typeof value === 'string') {
      const id = Object.create(ClientId.prototype);

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
