import { RequiredTeachers } from './required-teachers';

describe('RequiredTeachers', () => {
  it('should fail if amount is float', () => {
    const act = () => RequiredTeachers.create(1.15);

    expect(act).toThrow('amount must be integer');
  });

  it('should fail if amount is NaN', () => {
    const act = () => RequiredTeachers.create(NaN);

    expect(act).toThrow('amount must be integer');
  });

  it('should fail if amount is Infinity', () => {
    const act = () => RequiredTeachers.create(NaN);

    expect(act).toThrow('amount must be integer');
  });

  it('should fail if amount is 0', () => {
    const act = () => RequiredTeachers.create(0);

    expect(act).toThrow('amount must more than 0');
  });

  it('should fail if amount is -1', () => {
    const act = () => RequiredTeachers.create(-1);

    expect(act).toThrow('amount must more than 0');
  });

  it('should fail if amount is 4', () => {
    const act = () => RequiredTeachers.create(4);

    expect(act).toThrow('amount must less than 4');
  });

  it('should fail if amount is 5', () => {
    const act = () => RequiredTeachers.create(4);

    expect(act).toThrow('amount must less than 4');
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
