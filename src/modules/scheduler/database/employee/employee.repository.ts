import { Repository } from 'yuow';
import { Employee } from '../../domain';
import { EmployeeDataMapper } from './employee.datamapper';

export class EmployeeRepository extends Repository<
  Employee,
  EmployeeDataMapper
> {
  protected mapperConstructor = EmployeeDataMapper;

  protected extractIdentity(employee: Employee) {
    return employee.id;
  }

  async findOne(...args: Parameters<EmployeeDataMapper['findOne']>) {
    const result = await this.mapper.findOne(...args);

    return this.trackAll(result, 'loaded');
  }

  async findMany(...args: Parameters<EmployeeDataMapper['findMany']>) {
    const result = await this.mapper.findMany(...args);

    return this.trackAll(result, 'loaded');
  }
}
