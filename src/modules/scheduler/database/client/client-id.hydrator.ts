import { ClientId } from '../../domain';

export class ClientIdHydrator extends ClientId {
  constructor(id: string) {
    super(id);
  }
}
