import { Module, Inject } from '@nestjs/common';
import { mikroormProvider, MIKROORM_PROVIDER } from './database';
import { Knex } from 'knex';
import { MikroORM } from '@mikro-orm/postgresql';

@Module({
  imports: [],
  providers: [],
  exports: [mikroormProvider],
})
export class SharedModule {
  constructor(@Inject(MIKROORM_PROVIDER) private readonly orm: MikroORM) {}

  async beforeApplicationShutdown() {
    await this.orm.close();
  }
}
