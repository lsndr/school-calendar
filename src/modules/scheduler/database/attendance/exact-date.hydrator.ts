import { ExactDate, ExactDateState } from '../../domain/exact-date';

export class ExactDateHydrator extends ExactDate {
  constructor(state: ExactDateState) {
    super(state);
  }
}
