import { DomainError } from '../../../shared/domain';
import { RequiredTeachers } from './required-teachers';

describe('RequiredTeachers', () => {
  it('should fail if amount is float', () => {
    const act = () => RequiredTeachers.create(1.15);

    expect(act).toThrow(
      new DomainError('RequiredTeachers', 'amoun_is_not_integer'),
    );
  });

  it('should fail if amount is NaN', () => {
    const act = () => RequiredTeachers.create(NaN);

    expect(act).toThrow(
      new DomainError('RequiredTeachers', 'amoun_is_not_integer'),
    );
  });

  it('should fail if amount is Infinity', () => {
    const act = () => RequiredTeachers.create(NaN);

    expect(act).toThrow(
      new DomainError('RequiredTeachers', 'amoun_is_not_integer'),
    );
  });

  it('should fail if amount is 0', () => {
    const act = () => RequiredTeachers.create(0);

    expect(act).toThrow(
      new DomainError('RequiredTeachers', 'amount_is_negative'),
    );
  });

  it('should fail if amount is -1', () => {
    const act = () => RequiredTeachers.create(-1);

    expect(act).toThrow(
      new DomainError('RequiredTeachers', 'amount_is_negative'),
    );
  });

  it('should fail if amount is 4', () => {
    const act = () => RequiredTeachers.create(4);

    expect(act).toThrow(
      new DomainError('RequiredTeachers', 'amount_greater_than_3'),
    );
  });

  it('should fail if amount is 5', () => {
    const act = () => RequiredTeachers.create(4);

    expect(act).toThrow(
      new DomainError('RequiredTeachers', 'amount_greater_than_3'),
    );
  });

  it('should succeed if amount is 1', () => {
    const requiredTeachers = RequiredTeachers.create(1);

    expect(requiredTeachers.value).toBe(1);
  });

  it('should succeed if amount is 2', () => {
    const requiredTeachers = RequiredTeachers.create(2);

    expect(requiredTeachers.value).toBe(2);
  });

  it('should succeed if amount is 3', () => {
    const requiredTeachers = RequiredTeachers.create(3);

    expect(requiredTeachers.value).toBe(3);
  });
});
