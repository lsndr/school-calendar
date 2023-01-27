import { School, SchoolState } from '../../domain';

export class SchoolHydrator extends School {
  constructor(state: SchoolState) {
    super(state);
  }
}
