import { Client, ClientState } from '../../domain';

export class ClientHydrator extends Client {
  constructor(state: ClientState) {
    super(state);
  }
}
