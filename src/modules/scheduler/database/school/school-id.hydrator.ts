import { SchoolId } from '../../domain';

export class SchoolIdHydrator extends SchoolId {
  constructor(id: string) {
    super(id);
  }
}
