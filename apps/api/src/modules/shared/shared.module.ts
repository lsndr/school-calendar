import { Module } from '@nestjs/common';
import { mikroormProvider } from './database';
import { MikroORM } from '@mikro-orm/postgresql';
import { CqrsModule } from './cqrs';

@Module({
  imports: [CqrsModule],
  providers: [mikroormProvider],
  exports: [mikroormProvider, CqrsModule],
})
export class SharedModule {
  public constructor(private readonly orm: MikroORM) {}

  public async beforeApplicationShutdown(): Promise<void> {
    await this.orm.close();
  }
}
