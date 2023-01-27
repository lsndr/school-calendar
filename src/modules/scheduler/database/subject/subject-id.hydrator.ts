import { SubjectId } from '../../domain';

export class SubjectIdHydrator extends SubjectId {
  constructor(id: string) {
    super(id);
  }
}
