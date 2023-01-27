import { RequiredEmployees } from '../../domain';

export class RequiredEmployeesHydrator extends RequiredEmployees {
  constructor(amount: number) {
    super(amount);
  }
}
