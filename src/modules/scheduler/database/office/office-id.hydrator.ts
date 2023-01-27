import { OfficeId } from '../../domain';

export class OfficeIdHydrator extends OfficeId {
  constructor(id: string) {
    super(id);
  }
}
