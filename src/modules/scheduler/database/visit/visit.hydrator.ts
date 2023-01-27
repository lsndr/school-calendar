import { Visit, VisitState } from '../../domain';

export class VisitHydrator extends Visit {
  constructor(state: VisitState) {
    super(state);
  }
}
