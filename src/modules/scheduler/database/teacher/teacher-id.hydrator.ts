import { TeacherId } from '../../domain';

export class TeacherIdHydrator extends TeacherId {
  constructor(id: string) {
    super(id);
  }
}
