import { Module } from '@nestjs/common';
import { mikroormProvider } from './database';
import { MikroORM } from '@mikro-orm/postgresql';

@Module({
  imports: [],
  providers: [],
  exports: [mikroormProvider],
})
export class SharedModule {
  constructor(private readonly orm: MikroORM) {}

  async beforeApplicationShutdown() {
    await this.orm.close();
  }
}
