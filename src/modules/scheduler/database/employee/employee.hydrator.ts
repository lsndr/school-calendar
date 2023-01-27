import { Employee, EmployeeState } from '../../domain';

export class EmployeeHydrator extends Employee {
  constructor(state: EmployeeState) {
    super(state);
  }
}
