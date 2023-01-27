import { Subject, SubjectState } from '../../domain';

export class SubjectHydrator extends Subject {
  constructor(state: SubjectState) {
    super(state);
  }
}
