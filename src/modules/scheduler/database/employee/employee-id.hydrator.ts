import { EmployeeId } from '../../domain';

export class EmployeeIdHydrator extends EmployeeId {
  constructor(id: string) {
    super(id);
  }
}
