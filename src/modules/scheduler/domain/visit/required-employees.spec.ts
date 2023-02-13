import { DomainError } from '../../../shared/domain';
import { RequiredEmployees } from './required-employees';

describe('RequiredEmployees', () => {
  it('should fail if amount is float', () => {
    const act = () => RequiredEmployees.create(1.15);

    expect(act).toThrow(
      new DomainError('RequiredEmployees', 'amoun_is_not_integer'),
    );
  });

  it('should fail if amount is NaN', () => {
    const act = () => RequiredEmployees.create(NaN);

    expect(act).toThrow(
      new DomainError('RequiredEmployees', 'amoun_is_not_integer'),
    );
  });

  it('should fail if amount is Infinity', () => {
    const act = () => RequiredEmployees.create(NaN);

    expect(act).toThrow(
      new DomainError('RequiredEmployees', 'amoun_is_not_integer'),
    );
  });

  it('should fail if amount is 0', () => {
    const act = () => RequiredEmployees.create(0);

    expect(act).toThrow(
      new DomainError('RequiredEmployees', 'amount_is_negative'),
    );
  });

  it('should fail if amount is -1', () => {
    const act = () => RequiredEmployees.create(-1);

    expect(act).toThrow(
      new DomainError('RequiredEmployees', 'amount_is_negative'),
    );
  });

  it('should fail if amount is 4', () => {
    const act = () => RequiredEmployees.create(4);

    expect(act).toThrow(
      new DomainError('RequiredEmployees', 'amount_greater_than_3'),
    );
  });

  it('should fail if amount is 5', () => {
    const act = () => RequiredEmployees.create(4);

    expect(act).toThrow(
      new DomainError('RequiredEmployees', 'amount_greater_than_3'),
    );
  });

  it('should succeed if amount is 1', () => {
    const requiredEmployees = RequiredEmployees.create(1);

    expect(requiredEmployees.value).toBe(1);
  });

  it('should succeed if amount is 2', () => {
    const requiredEmployees = RequiredEmployees.create(2);

    expect(requiredEmployees.value).toBe(2);
  });

  it('should succeed if amount is 3', () => {
    const requiredEmployees = RequiredEmployees.create(3);

    expect(requiredEmployees.value).toBe(3);
  });
});
