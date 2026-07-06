import { MikroORM } from '@mikro-orm/sqlite';
import { Transactional } from './transactional';
import { Entity, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class TestEntity {
  @PrimaryKey()
  public id: string;

  public constructor(props: TestEntity) {
    this.id = props.id;
  }
}

export class NoOrmPropertyTransactionalFixture {
  @Transactional()
  public act(): Promise<void> {
    return Promise.resolve();
  }
}

export class TransactionalActionExecutorFixture {
  public attempts = 0;

  public constructor(private readonly orm: MikroORM) {}

  @Transactional()
  public async act(action: () => void): Promise<void> {
    await this.orm.reconnect();

    this.attempts++;
    return action();
  }
}
