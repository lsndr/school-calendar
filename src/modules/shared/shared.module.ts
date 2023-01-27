import { Module, Inject } from '@nestjs/common';
import { knexProvider, KNEX_PROVIDER, uowProvider } from './database';
import { Knex } from 'knex';

@Module({
  imports: [],
  providers: [knexProvider, uowProvider],
  exports: [knexProvider, uowProvider],
})
export class SharedModule {
  constructor(@Inject(KNEX_PROVIDER) private readonly knex: Knex) {}

  async beforeApplicationShutdown() {
    await this.knex.destroy();
  }
}
