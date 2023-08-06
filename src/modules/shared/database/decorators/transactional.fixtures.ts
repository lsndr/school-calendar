import { MikroORM } from '@mikro-orm/sqlite';
import { Transactional } from './transactional';
import { Entity, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class TestEntity {
  @PrimaryKey()
  id: string;

  constructor(props: TestEntity) {
    this.id = props.id;
  }
}

export class NoOrmPropertyTransactionalFixture {
  @Transactional()
  act() {
    return Promise.resolve();
  }
}

export class TransactionalActionExecutorFixture {
  public attempts = 0;

  constructor(private readonly orm: MikroORM) {}

  @Transactional()
  async act(action: () => void) {
    await this.orm.reconnect();

    this.attempts++;
    return action();
  }
}
