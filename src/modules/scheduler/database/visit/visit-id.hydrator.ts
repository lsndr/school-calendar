import { VisitId } from '../../domain';

export class VisitIdHydrator extends VisitId {
  constructor(id: string) {
    super(id);
  }
}
