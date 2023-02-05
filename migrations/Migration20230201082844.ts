import { Migration } from '@mikro-orm/migrations';

export class Migration20230201082844 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx || this.getKnex();

    return knex.schema.createTable('outbox', (table) => {
      table.text('id').primary();
      table.text('topic').notNullable();
      table.jsonb('payload').notNullable().index();
      table.dateTime('created_at', { useTz: false }).notNullable();
      table.dateTime('processed_at', { useTz: false });
    });
  }

  override async down(): Promise<void> {
    const knex = this.ctx || this.getKnex();

    return knex.schema.dropTable('outbox');
  }
}
