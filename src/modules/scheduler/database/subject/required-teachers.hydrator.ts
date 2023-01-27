import { RequiredTeachers } from '../../domain';

export class RequiredTeachersHydrator extends RequiredTeachers {
  constructor(amount: number) {
    super(amount);
  }
}
