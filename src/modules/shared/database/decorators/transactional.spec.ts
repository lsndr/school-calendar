import { MikroORM } from '@mikro-orm/sqlite';
import {
  NoOrmPropertyTransactionalFixture,
  TestEntity,
  TransactionalActionExecutorFixture,
} from './transactional.fixtures';
import { OptimisticLockError } from '@mikro-orm/core';

describe('Transactional', () => {
  let orm: MikroORM;

  beforeEach(async () => {
    orm = await MikroORM.init({
      dbName: ':memory:',
      entities: [TestEntity],
    });
  });

  afterEach(async () => {
    await orm.close();
  });

  it('should fail if class has no orm property', () => {
    // arrange
    const sub = new NoOrmPropertyTransactionalFixture();

    // act
    const act = async () => await sub.act();

    // assert
    expect(act).rejects.toThrowError(
      new Error(
        '@Transactional() decorator can only be applied to methods of classes with `orm: MikroORM` property`',
      ),
    );
  });

  it('should succeed without retries', async () => {
    // arrange
    const sub = new TransactionalActionExecutorFixture(orm);

    // act
    const result = await sub.act(() => 'done');

    // assert
    expect(result).toBe('done');
    expect(sub.attempts).toBe(1);
  });

  it('should fail without retries', async () => {
    // arrange
    const sub = new TransactionalActionExecutorFixture(orm);

    // act
    const act = sub.act(() => {
      throw new Error('Something went wrong');
    });

    // assert
    await expect(act).rejects.toThrow(new Error('Something went wrong'));
    expect(sub.attempts).toBe(1);
  });

  it('should try 3 times', async () => {
    // arrange
    const sub = new TransactionalActionExecutorFixture(orm);

    // act
    const act = sub.act(() => {
      throw new OptimisticLockError('Error');
    });

    // assert
    await expect(act).rejects.toThrow(new OptimisticLockError('Error'));
    expect(sub.attempts).toBe(3);
  });
});
