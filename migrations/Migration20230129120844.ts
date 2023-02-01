import { Migration } from '@mikro-orm/migrations';

export class Migration20230129120844 extends Migration {
  async up(): Promise<void> {
    const knex = this.getKnex();

    return knex.schema.createTable('school', (table) => {
      table.text('id').primary();
      table.string('name').notNullable();
      table.string('time_zone').notNullable();
      table.smallint('version').defaultTo(1).notNullable();
      table.dateTime('created_at', { useTz: false }).notNullable();
      table.dateTime('updated_at', { useTz: false }).notNullable();
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();

    return knex.schema.dropTable('school');
  }
}
