import { Office, OfficeState } from '../../domain';

export class OfficeHydrator extends Office {
  constructor(state: OfficeState) {
    super(state);
  }
}
