import { Teacher, TeacherState } from '../../domain';

export class TeacherHydrator extends Teacher {
  constructor(state: TeacherState) {
    super(state);
  }
}
