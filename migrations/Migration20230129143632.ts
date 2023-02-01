import { Migration } from '@mikro-orm/migrations';

export class Migration20230129143632 extends Migration {
  async up(): Promise<void> {
    const knex = this.getKnex();

    return knex.schema.createTable('group', (table) => {
      table.text('id').primary();
      table.text('name').notNullable();
      table.text('school_id').notNullable().index();
      table.smallint('version').notNullable().defaultTo(1);
      table.dateTime('created_at', { useTz: false }).notNullable();
      table.dateTime('updated_at', { useTz: false }).notNullable();
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();

    return knex.schema.dropTable('group');
  }
}
